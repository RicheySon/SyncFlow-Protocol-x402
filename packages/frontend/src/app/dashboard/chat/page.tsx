import { ChatInterface } from '../../../components/chat/ChatInterface';

export default function ChatPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Agent Chat</h1>
                <p className="text-muted-foreground">
                    Interact with your autonomous agent using natural language.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <ChatInterface />
            </div>
        </div>
    );
}
