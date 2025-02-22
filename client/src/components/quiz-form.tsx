import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quizSchema, type Quiz } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

type QuizFormProps = {
  onSubmit: (quiz: Quiz) => void;
  onPreview: (quiz: Quiz) => void;
};

export function QuizForm({ onSubmit, onPreview }: QuizFormProps) {
  const [preview, setPreview] = useState<Quiz | null>(null);
  const { toast } = useToast();
  
  const form = useForm<{ json: string }>({
    defaultValues: {
      json: "",
    },
  });

  const validateAndParseJSON = (jsonString: string): Quiz | null => {
    try {
      const parsed = JSON.parse(jsonString);
      const validated = quizSchema.parse(parsed);
      return validated;
    } catch (error) {
      toast({
        title: "Invalid Quiz Format",
        description: "Please check your JSON structure and try again",
        variant: "destructive",
      });
      return null;
    }
  };

  const handlePreview = () => {
    const quiz = validateAndParseJSON(form.getValues().json);
    if (quiz) {
      setPreview(quiz);
      onPreview(quiz);
    }
  };

  const handleSubmit = () => {
    const quiz = validateAndParseJSON(form.getValues().json);
    if (quiz) {
      onSubmit(quiz);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste your quiz JSON here..."
        className="min-h-[300px] font-mono"
        {...form.register("json")}
      />

      {preview && (
        <Card className="bg-muted">
          <CardContent className="p-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span>Quiz format validated successfully!</span>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button onClick={handlePreview} variant="outline">
          Preview Quiz
        </Button>
        <Button onClick={handleSubmit} disabled={!preview}>
          Submit Quiz
        </Button>
      </div>
    </div>
  );
}
