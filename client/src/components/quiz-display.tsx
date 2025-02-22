import { useState } from "react";
import { Quiz } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";

type QuizDisplayProps = {
  quiz: Quiz;
  onComplete: (score: number) => void;
};

export function QuizDisplay({ quiz, onComplete }: QuizDisplayProps) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentSubject = quiz.find((s) => s.subject === selectedSubject);
  const currentChapter = currentSubject?.chapters.find(
    (c) => c.chapterName === selectedChapter
  );
  const currentQuestion = currentChapter?.quizQuestions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
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
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(i => i - 1);
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

        {selectedSubject && (
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

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>
          Question {currentQuestionIndex + 1} of{" "}
          {currentChapter?.quizQuestions.length}
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
              className={`flex items-center space-x-2 p-2 rounded ${
                showResults
                  ? option === currentQuestion.correctAnswer
                    ? "bg-green-100"
                    : option === answers[currentQuestionIndex]
                    ? "bg-red-100"
                    : ""
                  : ""
              }`}
            >
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option}>{option}</Label>
              {showResults && option === currentQuestion.correctAnswer && (
                <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
              )}
              {showResults &&
                option === answers[currentQuestionIndex] &&
                option !== currentQuestion.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                )}
            </div>
          ))}
        </RadioGroup>

        {showResults && (
          <div className="bg-muted p-4 rounded">
            <p className="font-medium">Explanation:</p>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

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
      </CardContent>
    </Card>
  );
}