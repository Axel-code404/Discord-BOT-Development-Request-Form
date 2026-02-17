import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ChatMessageProps {
  content: string;
  isFromAdmin: boolean;
  createdAt: string | Date;
}

export default function ChatMessage({ content, isFromAdmin, createdAt }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full mb-4",
        isFromAdmin ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] rounded-2xl p-4 md:p-5 relative overflow-hidden backdrop-blur-md border shadow-lg",
          isFromAdmin
            ? "bg-black/40 border-secondary/30 text-white rounded-tl-none"
            : "bg-primary/10 border-primary/30 text-white rounded-tr-none"
        )}
      >
        {/* Glowing accent line */}
        <div 
          className={cn(
            "absolute top-0 w-full h-[1px]",
            isFromAdmin 
              ? "bg-gradient-to-r from-secondary/80 to-transparent left-0" 
              : "bg-gradient-to-l from-primary/80 to-transparent right-0"
          )} 
        />

        <p className="text-sm md:text-base font-light leading-relaxed whitespace-pre-wrap font-body">
          {content}
        </p>
        
        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
            {format(new Date(createdAt), "HH:mm")}
          </span>
          {isFromAdmin && (
            <span className="text-[10px] text-secondary font-bold font-sci-fi tracking-widest">
              ADMIN
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
