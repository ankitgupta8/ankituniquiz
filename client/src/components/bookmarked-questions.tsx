
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookmarkedQuestions() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      const data = await response.json();
      setBookmarks(data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const removeBookmark = async (id: number) => {
    try {
      await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No bookmarked questions available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Bookmarked Question</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeBookmark(bookmark.id)}
              >
                <BookmarkX className="h-5 w-5 text-primary" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{bookmark.questionData.question}</p>
            <p className="text-sm text-muted-foreground">
              Answer: {bookmark.questionData.correctAnswer}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
