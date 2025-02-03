
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as FramerMotion from "framer-motion";
import "../App.css";

const Quiz = () => {
  const motion = FramerMotion.motion;
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizSummary, setQuizSummary] = useState(null);  // State for quiz summary

  useEffect(() => {
    axios
      .get("http://localhost:5500/quiz")
      .then((response) => {
        setQuiz(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quiz data:", error);
        setLoading(false);
      });
  }, []);

  const handleOptionChange = (questionId, selectedOption) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
    setUnansweredQuestions((prev) => prev.filter((id) => id !== questionId));
  };

  const handleSubmitQuiz = () => {
    const unanswered = quiz.questions
      .filter((q) => !selectedAnswers[q.id])
      .map((q) => q.id);
    setUnansweredQuestions(unanswered);

    if (unanswered.length === 0) {
      let newScore = 0;
      quiz.questions.forEach((question) => {
        const correctAnswer = question.options.find(
          (option)  => option.is_correct === true
        );
        if (selectedAnswers[question.id] === correctAnswer.description) {
          newScore++;
        }
      });
      setScore(newScore);
      setQuizCompleted(true);

      // Create the quiz summary
      const correctAnswers = quiz.questions.filter(
        (q) => selectedAnswers[q.id] === q.options.find((option) => option.is_correct === true).description
      ).length;
  
      const incorrectAnswers = quiz.questions.length - correctAnswers;
      
      setQuizSummary({
        totalQuestions: quiz.questions.length,
        correctAnswers,
        incorrectAnswers,
        unanswered: unanswered.length,
      });
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setScore(null);
    setQuizCompleted(false);
    setUnansweredQuestions([]);
    setQuizSummary(null);  // Reset the quiz summary

    // Re-fetch the quiz data
    axios
      .get("http://localhost:5500/quiz")
      .then((response) => {
        setQuiz(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quiz data:", error);
        setLoading(false);
      });
  };

  if (loading) return <p>Loading quiz...</p>;
  if (!quiz) return <p>No quiz data found.</p>;

  return (
    <div className="quiz-container">
      {quizCompleted && quizSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="quiz-summary"
        >
          <h3>Quiz Summary</h3>
          <p>Total Questions: {quizSummary.totalQuestions}</p>
          <p>Correct Answers: {quizSummary.correctAnswers}</p>
          <p>Incorrect Answers: {quizSummary.incorrectAnswers}</p>
          <p>Unanswered Questions: {quizSummary.unanswered}</p>
          <motion.button
            onClick={handleRestartQuiz}
            className="restart-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Restart Quiz
          </motion.button>
        </motion.div>
      )}

      {!quizCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="quiz-content"
        >
          <h2 className="quiz-title">{quiz.title}</h2>
          <p>{quiz.description || "No description provided"}</p>

          <h3>Questions:</h3>
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="question-container">
              <strong>{index + 1}.</strong> {question.description}
              <br />
              {question.options.map((option, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.description}
                    onChange={() =>
                      handleOptionChange(question.id, option.description)
                    }
                    checked={selectedAnswers[question.id] === option.description}
                  />
                  {option.description}
                  <br />
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleSubmitQuiz}>Submit</button>
        </motion.div>
      )}
    </div>
  );
};

export default Quiz;
