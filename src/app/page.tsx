"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

import { WalletManager } from "@/components/wallet/WalletManager";

const models = [
  {
    name: "GPT 4o",
    value: "openai/gpt-4o",
  },
  {
    name: "Gemini 2.0 Flash Lite",
    value: "google/gemini-2.0-flash-lite",
  },
];
const suggestions = {
  "Use a paid tool": "Generate a random number between 1 and 10.",
  "What's my account balance?": "Check your account balance.",
  "Use an unpaid remotetool":
    "Please greet the user with 'hello-remote' by the name: 'user'",
  "Use an unpaid local tool":
    "Please greet the user with 'hello-local' by the name: 'user'",
};

const ChatBotDemo = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const { messages, sendMessage, status } = useChat({
    onError: (error) => console.error(error),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            model: model,
          },
        }
      );
      setInput("");
    }
  };

  const handleSuggestionClick = (suggestion: keyof typeof suggestions) => {
    sendMessage(
      { text: suggestions[suggestion] },
      {
        body: {
          model: model,
        },
      }
    );
  };

  return (
    <div className="w-full p-6 relative size-full max-w-4xl mx-auto">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <Response key={`${message.id}-${i}`}>
                          {part.text}
                        </Response>
                      );
                    } else if (part.type === "reasoning") {
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === "streaming"}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    } else if (
                      part.type === "dynamic-tool" ||
                      part.type.startsWith("tool-")
                    ) {
                      return (
                        <Tool defaultOpen={true} key={`${message.id}-${i}`}>
                          {/* @ts-expect-error */}
                          <ToolHeader part={part} />
                          <ToolContent>
                            {/* @ts-expect-error */}
                            <ToolInput input={part.input} />
                            <ToolOutput
                              // @ts-expect-error
                              part={part}
                              // @ts-expect-error
                              network={message.metadata?.network}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    } else {
                      return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && <Loader />}
            {status === "error" && <div>Something went wrong</div>}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <Suggestions className="justify-center">
          {Object.keys(suggestions).map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={() =>
                handleSuggestionClick(suggestion as keyof typeof suggestions)
              }
              variant="outline"
              size="sm"
            />
          ))}
        </Suggestions>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            ref={(ref) => {
              if (ref) {
                ref.focus();
              }
            }}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">x402 Payment Demo</h1>
              <p className="text-gray-600 mt-1">Create wallets, receive testnet funds, and test AI payments</p>
            </div>
            <div className="text-sm text-gray-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Base Sepolia Testnet
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Wallet Management</h2>
              <p className="text-gray-600 text-sm">
                Create and manage your testnet wallets, check balances, and request free testnet funds.
              </p>
            </div>
            <WalletManager />
          </div>

          {/* AI Chat Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Chat with Payments</h2>
              <p className="text-gray-600 text-sm">
                Interact with AI models and test payment-gated features using your wallets.
              </p>
            </div>
            <div className="bg-white rounded-lg border min-h-[600px]">
              <ChatBotDemo />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <div className="font-medium text-gray-900 mb-2">1. Create Wallets</div>
                <p>Generate new wallets for different purposes: purchasing, selling, or custom use cases.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-2">2. Get Testnet Funds</div>
                <p>Request free USDC and ETH from the Base Sepolia testnet faucet to test transactions.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-2">3. Test AI Payments</div>
                <p>Use your funded wallets to interact with AI models and test the x402 payment protocol.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
