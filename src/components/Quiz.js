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
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [carAnimation, setCarAnimation] = useState(false);
  const [quizVisible, setQuizVisible] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [carCrash, setCarCrash] = useState(false);
  const [carFinish, setCarFinish] = useState(false);
  const [restartVisible, setRestartVisible] = useState(false);  // State to control the visibility of the restart button
  const [quizSummary, setQuizSummary] = useState(null);  // State for quiz summary

  useEffect(() => {
    axios
      .get("https://quiz-server-toiu.onrender.com/quiz")
      .then((response) => {
        setQuiz(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quiz data:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted && quizVisible) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, quizCompleted, quizVisible]);

  const handleOptionChange = (questionId, selectedOption) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
    setUnansweredQuestions((prev) => prev.filter((id) => id !== questionId));
  };

  const handleStartQuiz = () => {
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        setCarAnimation(true);
        setTimeout(() => setQuizVisible(true), 1500);
      }
    }, 1000);
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
          (option) => option.is_correct === true
        );
        if (selectedAnswers[question.id] === correctAnswer.description) {
          newScore++;
        }
      });
      setScore(newScore);
      setQuizCompleted(true);
      setRestartVisible(true);  // Show the restart button after quiz completion
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

      if (newScore === 0) {
        setCarCrash(true);
      } else if (newScore === quiz.questions.length) {
        setCarFinish(true);
      }
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setScore(null);
    setPoints(0);
    setStreak(0);
    setTimeLeft(60);
    setQuizCompleted(false);
    setUnansweredQuestions([]);
    setCarAnimation(false);
    setQuizVisible(false);
    setCountdown(null);
    setCarCrash(false);
    setCarFinish(false);
    setRestartVisible(false);  // Hide the restart button after resetting the quiz
    setQuizSummary(null); 

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
      {countdown !== null && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
          className="countdown"
        >
          {countdown}
        </motion.div>
      )}

      {!quizVisible && (
        <motion.div
          initial={{ x: "-100vw" }}
          animate={{ x: carAnimation ? "50%" : "0%" }}
          transition={{ type: "spring", stiffness: 50 }}
          className="car-animation"
        >
          <img
            src="https://th.bing.com/th/id/R.7687e24b595b0dbbccede14bffd00c40?rik=avdOsZiUoFwiHw&riu=http%3a%2f%2fwww.pngall.com%2fwp-content%2fuploads%2f2016%2f07%2fCar-PNG-Image.png&ehk=F9gaKhdKWEa%2f8bDRqkEmeL2LVEh5zF7adJDc5A3gL3k%3d&risl=1&pid=ImgRaw&r=0"
            alt="Car"
            style={{ width: "150px", height: "auto" }}
          />
        </motion.div>
      )}

      {!quizVisible && countdown === null && (
        <motion.button
          onClick={handleStartQuiz}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Start Quiz
        </motion.button>
      )}
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

          {score !== null && !quizCompleted && (
            <motion.p
              className="finish-message"
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Your score: {score}/{quiz.questions.length}
            </motion.p>
          )}
      {quizVisible && !quizCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="quiz-content"
        >
          <h2 className="quiz-title">{quiz.title}</h2>
          <p>{quiz.description || "No description provided"}</p>

          <h3>Questions:</h3>
          
        
            <div>
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
                  {unansweredQuestions.includes(question.id) && (
                    <p className="error-message">Please answer this question.</p>
                  )}
                </div>
              ))}
              <button onClick={handleSubmitQuiz}>Submit</button>
            </div>
                 
         
        </motion.div>
      )}
      
    </div>
  );
};

export default Quiz;
