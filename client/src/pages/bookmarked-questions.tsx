import { useQuery, useMutation } from "@tanstack/react-query";
import { BookmarkedQuestion } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Bookmark, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BookmarkedQuestions() {
  const { toast } = useToast();
  const { data: bookmarks, isLoading, error } = useQuery<BookmarkedQuestion[]>({
    queryKey: ["/api/bookmarks"],
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId: number) => {
      const res = await apiRequest("DELETE", `/api/bookmarks/${bookmarkId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "Bookmark removed",
        description: "Question has been removed from bookmarks",
      });
    },
  });

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
              <p>Failed to load bookmarked questions. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bookmarked Questions</CardTitle>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {bookmarks?.length === 0 && (
                <p className="text-muted-foreground">No bookmarked questions yet.</p>
              )}
              {bookmarks?.map((bookmark) => (
                <Card key={bookmark.id} className="bg-muted">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{bookmark.subject} - {bookmark.chapterName}</h3>
                        <p className="mt-2">{bookmark.question}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBookmarkMutation.mutate(bookmark.id)}
                      >
                        <Bookmark className="h-4 w-4 fill-current" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {bookmark.options.map((option) => (
                        <div
                          key={option}
                          className={`p-4 rounded-lg border ${
                            option === bookmark.correctAnswer
                              ? "bg-green-100 border-green-200"
                              : ""
                          }`}
                        >
                          {option}
                          {option === bookmark.correctAnswer && (
                            <span className="ml-2 text-green-600 text-sm">
                              (Correct Answer)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-background rounded-lg p-4 mt-4">
                      <p className="font-medium mb-2">Explanation:</p>
                      <p className="text-muted-foreground">{bookmark.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
