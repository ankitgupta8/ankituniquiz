import { useState } from "react";
import { Quiz } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Eye, Home, Bookmark, BookmarkX } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { toast } from 'react-hot-toast'; // Added import for toast notifications

type QuizDisplayProps = {
  quiz: Quiz;
  onComplete: (score: number) => void;
  subject?: string;
};

export function QuizDisplay({ quiz, onComplete, subject }: QuizDisplayProps) {
  const [selectedSubject, setSelectedSubject] = useState(subject || "");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showCurrentAnswer, setShowCurrentAnswer] = useState(false);
  const [bookmarks, setBookmarks] = useState([]); // Added bookmark state

  const currentSubject = quiz.find((s) => s.subject === selectedSubject);
  const currentChapter = currentSubject?.chapters.find(
    (c) => c.chapterName === selectedChapter
  );
  const currentQuestion = currentChapter?.quizQuestions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
    setShowCurrentAnswer(false);
  };

  const calculateScore = () => {
    if (!currentChapter) return 0;
    const correctAnswers = currentChapter.quizQuestions.reduce(
      (acc, q, idx) => (q.correctAnswer === answers[idx] ? acc + 1 : acc),
      0
    );
    return Math.round((correctAnswers / currentChapter.quizQuestions.length) * 100);
  };

  const handleNext = () => {
    if (currentChapter && currentQuestionIndex < currentChapter.quizQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setShowCurrentAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(i => i - 1);
      setShowCurrentAnswer(false);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
    if (currentChapter && answers.length === currentChapter.quizQuestions.length) {
      const score = calculateScore();
      onComplete(score);
    }
  };

  const [isBookmarked, setIsBookmarked] = useState(false); // Added bookmark state

  const handleBookmark = async () => {
    if (!currentQuestion) return; // Handle case where currentQuestion is null
    try {
      const bookmarkIndex = bookmarks.findIndex(b => b.questionData.question === currentQuestion.question);
      const method = bookmarkIndex !== -1 ? 'DELETE' : 'POST';
      const bookmarkId = bookmarkIndex !== -1 ? bookmarks[bookmarkIndex].id : undefined;
      const url = bookmarkId ? `/api/bookmarks/${bookmarkId}` : '/api/bookmarks';
      const body = method === 'POST' ? JSON.stringify({ questionData: currentQuestion }) : undefined;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (response.ok) {
        if (method === 'POST') {
          const newBookmark = await response.json();
          setBookmarks([...bookmarks, newBookmark]);
        } else {
          setBookmarks(bookmarks.filter((_, index) => index !== bookmarkIndex));
        }
        setIsBookmarked(!isBookmarked);
        toast({
          title: bookmarkIndex !== -1 ? "Bookmark removed" : "Question bookmarked",
          duration: 2000
        });
      } else {
        console.error("Error during bookmark operation", await response.text());
        toast({
          title: "Error handling bookmark",
          variant: "destructive",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error handling bookmark:', error);
      toast({
        title: "Error handling bookmark",
        variant: "destructive",
        duration: 2000
      });
    }
  };


  if (!selectedSubject || !selectedChapter) {
    return (
      <div className="space-y-4">
        {!subject && !selectedSubject && (
          <Select onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {quiz.map((subject) => (
                <SelectItem key={subject.subject} value={subject.subject}>
                  {subject.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(selectedSubject || subject) && (
          <Select onValueChange={setSelectedChapter}>
            <SelectTrigger>
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent>
              {currentSubject?.chapters.map((chapter) => (
                <SelectItem key={chapter.chapterName} value={chapter.chapterName}>
                  {chapter.chapterName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  if (!currentQuestion) return null;

  const allQuestionsAnswered = currentChapter && 
    answers.length === currentChapter.quizQuestions.length && 
    answers.every(answer => answer);

  const isCurrentAnswerCorrect = answers[currentQuestionIndex] === currentQuestion.correctAnswer;

  // Determine bookmark status
  const currentBookmark = bookmarks.find(b => b.questionData.question === currentQuestion.question);
  setIsBookmarked(!!currentBookmark);

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{currentQuestion.question}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBookmark}
              className={`transition-colors ${isBookmarked ? 'text-primary' : ''}`}
            >
              <Bookmark className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">{currentQuestion.question}</p>

          <RadioGroup
            value={answers[currentQuestionIndex]}
            onValueChange={handleAnswer}
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option}
                className={`flex items-center space-x-2 p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  (showCurrentAnswer || showResults) &&
                  (option === currentQuestion.correctAnswer
                    ? "bg-green-100 border-green-200"
                    : option === answers[currentQuestionIndex]
                    ? "bg-red-100 border-red-200"
                    : "")
                }`}
              >
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer">
                  {option}
                </Label>
                {(showCurrentAnswer || showResults) && (
                  <>
                    {option === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                    )}
                    {option === answers[currentQuestionIndex] &&
                      option !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                      )}
                  </>
                )}
              </div>
            ))}
          </RadioGroup>

          {(showCurrentAnswer || showResults) && (
            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">Explanation:</p>
                <p>{currentQuestion.explanation}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-xl font-bold">
                Final Score: {calculateScore()}%
              </p>
              <div className="space-y-6">
                {currentChapter?.quizQuestions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <p className="font-medium">
                      Question {index + 1}: {question.question}
                    </p>
                    <p className={answers[index] === question.correctAnswer ? "text-green-600" : "text-red-600"}>
                      Your Answer: {answers[index]}
                    </p>
                    <p className="text-green-600">
                      Correct Answer: {question.correctAnswer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {question.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="container flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCurrentAnswer(true)}
              disabled={!answers[currentQuestionIndex]}
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Answer
            </Button>
          </div>

          {allQuestionsAnswered && !showResults ? (
            <Button onClick={handleSubmit}>
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                !answers[currentQuestionIndex] ||
                currentQuestionIndex === currentChapter!.quizQuestions.length - 1
              }
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}