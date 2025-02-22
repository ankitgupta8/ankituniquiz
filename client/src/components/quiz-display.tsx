import { useState } from "react";
import { Quiz } from "@shared/schema";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Eye, Home } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const handlePrevious = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
    setShowCurrentAnswer(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex === currentChapter!.quizQuestions.length - 1) {
      setShowResults(true);
      onComplete(calculateScore());
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowCurrentAnswer(false);
    }
  };

  if (!quiz.length) {
    return (
      <Alert>
        <AlertDescription>No quiz data available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedSubject && (
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a subject" />
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

      {selectedSubject && !selectedChapter && (
        <Select value={selectedChapter} onValueChange={setSelectedChapter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a chapter" />
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

      {selectedChapter && !showResults && currentQuestion && (
        <Card className="quiz-card dark:bg-gray-800 dark:text-gray-100"> {/* Added dark mode styling to Card */}
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground"> {/* Added text-foreground */}
              Question {currentQuestionIndex + 1} of {currentChapter?.quizQuestions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-foreground">{currentQuestion.question}</p> {/* Added text-foreground */}
            <RadioGroup value={answers[currentQuestionIndex] || ""} onValueChange={handleAnswer}>
              {currentQuestion.options.map((option) => (
                <div
                  key={option}
                  className={`flex items-center space-x-2 p-4 rounded-lg border transition-colors
                    ${answers[currentQuestionIndex] === option
                    ? showCurrentAnswer
                      ? answers[currentQuestionIndex] === currentQuestion.correctAnswer
                        ? "bg-green-100 border-green-200 dark:bg-green-700 dark:text-white"
                        : "bg-red-100 border-red-200 dark:bg-red-700 dark:text-white"
                      : "dark:text-gray-200"
                    : ""}`}
                >
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer text-foreground"> {/* Added text-foreground */}
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between dark:text-gray-100 dark:border-gray-700"> {/*Added darkmode styling*/}
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="rounded-lg dark:text-gray-100 dark:border-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCurrentAnswer(true)}
              disabled={!answers[currentQuestionIndex]}
              className="rounded-lg dark:text-gray-100 dark:border-gray-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Answer
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestionIndex]}
              className="rounded-lg dark:text-gray-100 dark:border-gray-700"
            >
              {currentQuestionIndex === currentChapter!.quizQuestions.length - 1 ? "Finish" : "Next"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {showResults && (
        <Card className="rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-100">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-xl font-bold text-gray-100">
                Final Score: {calculateScore()}%
              </p>
              <div className="space-y-6">
                {currentChapter?.quizQuestions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <p className="font-medium text-gray-100">
                      Question {index + 1}: {question.question}
                    </p>
                    <p className={answers[index] === question.correctAnswer ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}>
                      Your Answer: {answers[index]}
                    </p>
                    <p className="text-green-600 dark:text-green-300">
                      Correct Answer: {question.correctAnswer}
                    </p>
                    <p className="text-sm text-gray-200">
                      {question.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button className="flex items-center gap-2 dark:text-gray-100 dark:border-gray-700"> {/*Added darkmode styling*/}
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}