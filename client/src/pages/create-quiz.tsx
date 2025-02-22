import { useState } from "react";
import { QuizForm } from "@/components/quiz-form";
import { QuizDisplay } from "@/components/quiz-display";
import { Quiz } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateQuiz() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (data: { quizData: Quiz; score: number }) => {
      // Add a flag to indicate this is a quiz creation
      const res = await apiRequest("POST", "/api/quizzes", { ...data, isQuizCreation: true });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz Created",
        description: "Your quiz has been saved successfully",
      });
      setLocation("/");
    },
  });

  const handlePreview = (newQuiz: Quiz) => {
    setQuiz(newQuiz);
  };

  const handleSubmit = (newQuiz: Quiz) => {
    submitMutation.mutate({ quizData: newQuiz, score: 0 });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create">
              <TabsList>
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="preview" disabled={!quiz}>
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <QuizForm onPreview={handlePreview} onSubmit={handleSubmit} />
              </TabsContent>

              <TabsContent value="preview">
                {quiz && (
                  <QuizDisplay
                    quiz={quiz}
                    onComplete={() => {
                      // Preview mode - no completion handling needed
                    }}
                  />
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Example JSON Structure</h3>
              <Card className="bg-muted">
                <CardContent>
                  <pre 
                    className="p-4 rounded-lg cursor-pointer" 
                    onClick={(e) => {
                      const text = e.currentTarget.textContent;
                      if (text) navigator.clipboard.writeText(text);
                      toast({
                        title: "Copied!",
                        description: "JSON structure copied to clipboard",
                      });
                    }}
                  >
{`[
  {
    "subject": "Mathematics",
    "chapters": [
      {
        "chapterName": "Algebra",
        "quizQuestions": [
          {
            "question": "What is the value of x in 2x + 4 = 10?",
            "options": ["2", "3", "4", "5"],
            "correctAnswer": "3",
            "explanation": "Subtract 4 from both sides: 2x = 6, then divide by 2: x = 3"
          }
        ]
      }
    ]
  }
]`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}