import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Zmień URL na swój adres API Laravel
  const API_BASE_URL = 'http://your-laravel-api.com/api';

  const questions = [
    {
      id: 1,
      question: "Jakie jest największe miasto w Polsce?",
      options: ["Warszawa", "Kraków", "Gdańsk", "Wrocław"]
    },
    {
      id: 2,
      question: "W którym roku Polska wstąpiła do UE?",
      options: ["2003", "2004", "2005", "2006"]
    },
    {
      id: 3,
      question: "Która rzeka przepływa przez Warszawę?",
      options: ["Odra", "Wisła", "Warta", "Bug"]
    }
  ];

  const handleDotPress = (index) => {
    setCurrentQuestion(index);
  };

  const checkAnswer = async (questionId, selectedAnswer) => {
    setIsLoading(true);
    
    try {
      // Wysyłaj tylko question_id, nie answer
      const response = await fetch(`${API_BASE_URL}/get-correct-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // PORÓWNAJ W REACT NATIVE
        const isCorrect = data.correct_answer === selectedAnswer;
        
        // Zapisz odpowiedź
        setSelectedAnswers(prev => ({
          ...prev,
          [questionId]: {
            answer: selectedAnswer,
            isCorrect: isCorrect
          }
        }));

        // Pokaż wynik
        Alert.alert(
          isCorrect ? 'Poprawna odpowiedź!' : 'Niepoprawna odpowiedź',
          isCorrect ? 'Brawo!' : `Poprawna odpowiedź to: ${data.correct_answer}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać poprawnej odpowiedzi');
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      Alert.alert('Błąd', 'Problemy z połączeniem z serwerem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerPress = (answer) => {
    const questionId = questions[currentQuestion].id;
    checkAnswer(questionId, answer);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quiz App</Text>
        <Text style={styles.subtitle}>Pytanie {currentQuestion + 1} z {questions.length}</Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {questions[currentQuestion].question}
        </Text>
        
        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option, index) => {
            const questionId = questions[currentQuestion].id;
            const selectedAnswer = selectedAnswers[questionId];
            const isSelected = selectedAnswer && selectedAnswer.answer === option;
            const isCorrect = selectedAnswer && selectedAnswer.isCorrect;
            const isIncorrect = selectedAnswer && !selectedAnswer.isCorrect && isSelected;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && isCorrect && styles.correctOption,
                  isIncorrect && styles.incorrectOption,
                  isLoading && styles.disabledOption
                ]}
                onPress={() => handleAnswerPress(option)}
                disabled={isLoading || selectedAnswer}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && isCorrect && styles.correctText,
                  isIncorrect && styles.incorrectText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Navigation Dots */}
      <View style={styles.dotsContainer}>
        {questions.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDotPress(index)}
            style={[
              styles.dot,
              currentQuestion === index ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>

      <Text style={styles.instruction}>
        {isLoading ? 'Sprawdzanie odpowiedzi...' : 'Kliknij na odpowiedź lub kropkę aby przejść do pytania'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.2 }],
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  disabledOption: {
    opacity: 0.6,
  },
  correctText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  incorrectText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  instruction: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
});