// ChatCard.js
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon } from "./utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function ChatCard() {
  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-hide pr-4">
          <div className="flex flex-col gap-2">
            {[...Array(10)].map((_, index) => (
              <div key={`message-${index}`}>
                <div
                  key={`other-${index}`}
                  className="flex items-start gap-4 mt-4"
                >
                  <Avatar>
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40`}
                      alt="User Avatar"
                    />
                    <AvatarFallback>U{index + 1}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1 text-sm">
                    <div className="font-medium">User {index + 1}</div>
                    <div className="bg-muted px-3 py-2 rounded-lg max-w-[80%]">
                      This is a message from User {index + 1}.
                    </div>
                  </div>
                </div>
                <div
                  key={`you-${index}`}
                  className="flex items-start gap-4 justify-end"
                >
                  <div className="grid gap-1 text-sm">
                    <div className="font-medium text-right">You</div>
                    <div className="bg-primary px-3 py-2 rounded-lg max-w-[80%] text-primary-foreground ml-auto">
                      This is your response to User {index + 1}.
                    </div>
                  </div>
                  <Avatar>
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="Your Avatar"
                    />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <div className="relative w-full mt-4">
          <Textarea
            placeholder="Type your message..."
            className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16 scrollbar-hide"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute w-8 h-8 top-3 right-3"
          >
            <ArrowUpIcon className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
