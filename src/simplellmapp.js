import "dotenv/config";
import { ChatAnthropic } from "@langchain/anthropic";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";


const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-20240620",
  temperature: 0
});

const messages = [
  new SystemMessage("Translate the following from English into Italian"),
  new HumanMessage("hi!"),
];

await model.invoke(messages);

const parser = new StringOutputParser();

const outputParserResult = await model.invoke(messages);

await parser.invoke(outputParserResult);

const chain = model.pipe(parser);

console.log(await chain.invoke(messages));

const systemTemplate = "Translate the following into {language}:";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{text}"],
]);

const promptTemplateResult = await promptTemplate.invoke({ language: 'italian', text: 'hi' });
console.log(promptTemplateResult.toChatMessages());

const promptTemplateChain = promptTemplate.pipe(model).pipe(parser);
const combineModelOutputParserResult = await promptTemplateChain.invoke({ language: 'italian', text: 'hi' });
console.log(combineModelOutputParserResult);