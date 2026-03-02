import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";

interface Message {
  role: "user" | "bot";
  text: string;
}

const responses: Record<string, string> = {
  complaint: "To submit a complaint, go to the **Report Issue** page. Fill in your details, select a category, describe the issue, and upload evidence images. Each image is verified by our AI before submission.",
  track: "Visit the **Track** page and enter your complaint ID (first 8 characters). You'll see real-time progress, status updates, and officer assignments.",
  streetlight: "Street Lighting falls under our **Street Lighting** category. Common issues include broken bulbs, flickering lights, and dark zones. Submit a report with the exact location for fast resolution.",
  pothole: "Potholes are categorized under **Potholes**. Include a clear photo and the exact street name for priority routing.",
  water: "Water supply issues can be reported under the **Water Supply** category. Include details like low pressure, contamination, or leaks.",
  garbage: "Garbage collection issues fall under **Garbage**. Report missed pickups, overflowing bins, or illegal dumping with location details.",
  sewage: "Sewage problems are under the **Sewage** category. For urgent blockages or overflows, include photos and precise location.",
  road: "Road repair issues go under **Road Repair**. Document the damage with photos for faster processing.",
  escalation: "Complaints unresolved for **48+ hours** are automatically flagged for social media escalation. This ensures accountability and faster resolution.",
  status: "Complaint statuses: **Pending** → **Assigned** → **In Progress** → **Resolved**. Issues can also be **Escalated** if unresolved after 48 hours.",
  hello: "Hello! I'm the CivicFix AI Assistant. I can help you with complaint submission, tracking, categories, and more. What would you like to know?",
  hi: "Hi there! 👋 How can I help you with your civic issues today?",
  help: "I can help with:\n• **Submitting complaints** — say 'complaint'\n• **Tracking progress** — say 'track'\n• **Category info** — say 'streetlight', 'pothole', 'water', etc.\n• **Escalation rules** — say 'escalation'\n• **Status meanings** — say 'status'",
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, value] of Object.entries(responses)) {
    if (lower.includes(key)) return value;
  }
  return "I'm not sure about that. Try asking about **complaint submission**, **tracking**, specific **categories** (streetlight, pothole, water, garbage), or **escalation** rules. Type **help** for a full list.";
};

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Welcome to CivicFix AI Assistant! 🏙️ I can help you navigate our civic reporting platform. Try typing **help** to see what I can assist with." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: Message = { role: "bot", text: getResponse(userMsg.text) };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center justify-center rounded-xl gradient-hero p-3 mb-3">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground text-sm">Ask me anything about civic issue reporting</p>
        </div>

        <div className="glass-card rounded-2xl flex flex-col h-[500px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === "bot" ? "gradient-hero" : "bg-muted"}`}>
                  {msg.role === "bot" ? <Bot className="h-3.5 w-3.5 text-primary-foreground" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.role === "bot" ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                  <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                    __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                  }} />
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your question..."
              className="flex-1"
            />
            <Button onClick={send} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
