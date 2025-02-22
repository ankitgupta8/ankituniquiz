import { useState } from "react";
import { QuizDisplay } from "@/components/quiz-display";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Quiz, QuizAttempt } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function TakeQuiz() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: attempts, isLoading, error } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/quizzes"],
  });

  // Get unique quizzes by comparing stringified quiz data
  const uniqueQuizzes = attempts?.reduce<Quiz[]>((acc, curr) => {
    const quizData = curr.quizData as Quiz;
    const exists = acc.some(
      (q) => JSON.stringify(q) === JSON.stringify(quizData)
    );
    if (!exists) {
      acc.push(quizData);
    }
    return acc;
  }, []) || [];

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
    onError: (error: Error) => {
      toast({
        title: "Failed to save quiz attempt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleComplete = (score: number) => {
    if (selectedQuiz) {
      submitMutation.mutate({
        quizData: selectedQuiz,
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load quizzes. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!uniqueQuizzes.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Take Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No quizzes available. Create a quiz first!
              </p>
            </CardContent>
          </Card>
        </div>
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
                {uniqueQuizzes.map((quiz, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedQuiz(quiz)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">
                          {quiz[0]?.subject || "Untitled Quiz"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {quiz[0]?.chapters.length} chapter(s)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <QuizDisplay quiz={selectedQuiz} onComplete={handleComplete} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}