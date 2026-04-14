import { useState, useEffect, useCallback } from 'react';

interface UseGameLoopOptions {
  initialTime?: number;
  initialHealth?: number;
  initialEnemyHealth?: number;
  totalQuestions?: number;
  onTimeOut?: () => void;
  onGameFinish?: (survived: boolean) => void;
  isTimeStopped?: boolean;
  timeInterval?: number; // Para efectos como Chronos (500ms vs 1000ms)
}

/**
 * Hook reutilizable para el loop de juegos tipo trivia.
 * Maneja timer, salud, progreso de preguntas y condiciones de victoria/derrota.
 */
export function useGameLoop({
  initialTime = 15,
  initialHealth = 100,
  initialEnemyHealth = 100,
  totalQuestions = 50,
  onTimeOut,
  onGameFinish,
  isTimeStopped = false,
  timeInterval = 1000,
}: UseGameLoopOptions) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [health, setHealth] = useState(initialHealth);
  const [enemyHealth, setEnemyHealth] = useState(initialEnemyHealth);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [revealedImage, setRevealedImage] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const [isEnemyDamaged, setIsEnemyDamaged] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !revealedImage && !isTimeStopped) {
      const timer = setTimeout(() => {
        setTimeLeft(t => t - 1);
      }, timeInterval);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !revealedImage && !isTimeStopped) {
      onTimeOut?.();
    }
  }, [timeLeft, revealedImage, isTimeStopped, onTimeOut, timeInterval]);

  // Trigger damage animation
  const triggerDamage = useCallback((target: 'player' | 'enemy') => {
    if (target === 'player') {
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 500);
    } else {
      setIsEnemyDamaged(true);
      setTimeout(() => setIsEnemyDamaged(false), 500);
    }
  }, []);

  // Move to next question
  const moveToNext = useCallback((wasCorrect: boolean) => {
    if (currentQuestion + 1 < totalQuestions) {
      setCurrentQuestion(q => q + 1);
      
      // Reset timer for next question
      setTimeLeft(initialTime);
      setRevealedImage(false);
    } else {
      // Game finished
      onGameFinish?.(health > 0);
    }
  }, [currentQuestion, totalQuestions, initialTime, onGameFinish, health]);

  // Check if player is dead
  const checkDeath = useCallback(() => {
    if (health <= 0) {
      onGameFinish?.(false);
      return true;
    }
    return false;
  }, [health, onGameFinish]);

  return {
    timeLeft,
    setTimeLeft,
    health,
    setHealth,
    enemyHealth,
    setEnemyHealth,
    currentQuestion,
    revealedImage,
    setRevealedImage,
    isDamaged,
    isEnemyDamaged,
    triggerDamage,
    moveToNext,
    checkDeath,
  };
}
