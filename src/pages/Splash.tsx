import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';

export function Splash() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => navigate('/home'), 500); // Wait for fade out
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="flex flex-col items-center text-white"
          >
            <div className="bg-white text-primary p-6 rounded-3xl shadow-2xl mb-6">
              <Utensils size={64} strokeWidth={2} />
            </div>
            <h1 className="font-display font-bold text-4xl mb-2 tracking-tight text-center">
              Smart Meal<br/>Planner
            </h1>
            <p className="text-primary-light font-medium text-lg tracking-wide">
              Plan Smart, Eat Healthy
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
