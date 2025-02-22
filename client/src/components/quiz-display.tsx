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
import { CheckCircle2, XCircle, Eye, Home } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";

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

  return (
    <div className="space-y-6 pb-24 bg-gradient-to-b from-sky-100 to-blue-100 rounded-lg shadow-lg p-6 dark:bg-gray-900">
      <Card className="rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Question {currentQuestionIndex + 1} of{" "}
            {currentChapter?.quizQuestions.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-700 dark:text-gray-200">{currentQuestion.question}</p>

          <RadioGroup
            value={answers[currentQuestionIndex]}
            onValueChange={handleAnswer}
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option}
                className={`flex items-center space-x-2 p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer dark:border-gray-700 ${
                  (showCurrentAnswer || showResults) &&
                  (option === currentQuestion.correctAnswer
                    ? "bg-green-100 border-green-200 dark:bg-green-700 dark:text-white"
                    : option === answers[currentQuestionIndex]
                    ? "bg-red-100 border-red-200 dark:bg-red-700 dark:text-white"
                    : "dark:text-gray-200"
                }`}
              >
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer text-gray-800 dark:text-gray-200">
                  {option}
                </Label>
                {(showCurrentAnswer || showResults) && (
                  <>
                    {option === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-300 ml-auto" />
                    )}
                    {option === answers[currentQuestionIndex] &&
                      option !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500 dark:text-red-300 ml-auto" />
                      )}
                  </>
                )}
              </div>
            ))}
          </RadioGroup>

          {(showCurrentAnswer || showResults) && (
            <Alert className="rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-100">
              <AlertDescription>
                <p className="font-medium mb-2 text-gray-800 dark:text-gray-100">Explanation:</p>
                <p className="text-gray-700 dark:text-gray-200">{currentQuestion.explanation}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showResults && (
        <Card className="rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Final Score: {calculateScore()}%
              </p>
              <div className="space-y-6">
                {currentChapter?.quizQuestions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      Question {index + 1}: {question.question}
                    </p>
                    <p className={answers[index] === question.correctAnswer ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}>
                      Your Answer: {answers[index]}
                    </p>
                    <p className="text-green-600 dark:text-green-300">
                      Correct Answer: {question.correctAnswer}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-200">
                      {question.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="bg-blue-500 hover:bg-blue-700 text-white rounded-lg dark:bg-blue-600 dark:hover:bg-blue-800">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 rounded-t-lg dark:bg-gray-900 dark:border-gray-700">
        <div className="container flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="rounded-lg dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCurrentAnswer(true)}
              disabled={!answers[currentQuestionIndex]}
              className="rounded-lg dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Answer
            </Button>
          </div>

          {allQuestionsAnswered && !showResults ? (
            <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-700 text-white rounded-lg dark:bg-blue-600 dark:hover:bg-blue-800">
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                !answers[currentQuestionIndex] ||
                currentQuestionIndex === currentChapter!.quizQuestions.length - 1
              }
              className="rounded-lg dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}