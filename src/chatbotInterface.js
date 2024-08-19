import "dotenv/config";
import readline from "node:readline";
import { ChatAnthropic } from "@langchain/anthropic";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";

// Initialize the model
const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-20240620",
  temperature: 0,
});

// Create the message history and prompt template
const messageHistories = {};
const prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are a helpful assistant who remembers all details the user shares with you.`],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
]);

const chain = prompt.pipe(model);

const withMessageHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: async (sessionId) => {
    if (messageHistories[sessionId] === undefined) {
      messageHistories[sessionId] = new InMemoryChatMessageHistory();
    }
    return messageHistories[sessionId];
  },
  inputMessagesKey: "input",
  historyMessagesKey: "chat_history",
});

// Setup the readline interface for terminal input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You: ",
});

const sessionId = "abc-terminal";

// Function to handle user input and interact with the chatbot
async function handleUserInput(input) {
  const config = {
    configurable: {
      sessionId,
    },
  };

  // Response without stream
  // const response = await withMessageHistory.invoke({ input }, config);
  // console.log(`AI: ${response.content}`);

  
  // Stream the response content using for await...of loop
  const stream = await withMessageHistory.stream({ input }, config);
  // Stream the response content
  process.stdout.write("AI: "); 
  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
  }
  console.log(); // New line after streaming ends
  rl.prompt();
};

// Start the CLI
console.log("Welcome to the chatbot! Type your message below:");
rl.prompt();

rl.on('line', async (input) => {
  if (input.toLowerCase() === 'exit') {
    rl.close();
  }
  await handleUserInput(input);
  rl.prompt();
}).on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
