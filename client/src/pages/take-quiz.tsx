import { useState } from "react";
import { QuizDisplay } from "@/components/quiz-display";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Quiz, QuizAttempt } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TakeQuiz() {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizAttempt | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: attempts, isLoading } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/quizzes"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { quizData: Quiz; score: number }) => {
      const res = await apiRequest("POST", "/api/quizzes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Quiz Completed",
        description: "Your attempt has been saved",
      });
      setLocation("/");
    },
  });

  const handleComplete = (score: number) => {
    if (selectedQuiz) {
      submitMutation.mutate({
        quizData: selectedQuiz.quizData as Quiz,
        score,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Take Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedQuiz ? (
              <div className="grid gap-4">
                {attempts?.map((attempt) => (
                  <Card
                    key={attempt.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedQuiz(attempt)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">
                          {(attempt.quizData as any)[0].subject}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click to start
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <QuizDisplay
                quiz={selectedQuiz.quizData as Quiz}
                onComplete={handleComplete}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
