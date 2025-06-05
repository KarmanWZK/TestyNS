import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);

  const API_BASE_URL = 'http://192.168.1.103:3000'; // Ensure this matches your server's IP and port

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

  const checkAnswer = async (questionId, selectedAnswer) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/get-correct-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ question_id: questionId })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.correct_answer) {
        throw new Error('Nieprawidłowa odpowiedź serwera.');
      }

      const isCorrect = data.correct_answer === selectedAnswer;

      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: {
          answer: selectedAnswer,
          isCorrect
        }
      }));

      Alert.alert(
        isCorrect ? 'Poprawna odpowiedź!' : 'Niepoprawna odpowiedź',
        isCorrect ? 'Brawo!' : `Poprawna odpowiedź to: ${data.correct_answer}`,
        [
          {
            text: 'Dalej',
            onPress: () => {
              if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
              } else {
                setIsSummaryVisible(true);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Błąd:', error);
      Alert.alert('Błąd', 'Nie udało się sprawdzić odpowiedzi. Sprawdź połączenie z serwerem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerPress = (answer) => {
    const questionId = questions[currentQuestion].id;
    checkAnswer(questionId, answer);
  };

  const handleDotPress = (index) => {
    setCurrentQuestion(index);
  };

  const resetApp = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setIsSummaryVisible(false);
  };

  const calculateScore = () => {
    return Object.values(selectedAnswers).filter(answer => answer.isCorrect).length;
  };

  if (isSummaryVisible) {
    const score = calculateScore();
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.title}>Podsumowanie</Text>
        </View>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Twój wynik: {score} / {questions.length}</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetApp}>
            <Text style={styles.resetButtonText}>Zresetuj Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[question.id];

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>Quiz App</Text>
        <Text style={styles.subtitle}>Pytanie {currentQuestion + 1} z {questions.length}</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer?.answer === option;
            const isCorrect = selectedAnswer?.isCorrect;
            const isIncorrect = isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && isCorrect && styles.correctOption,
                  isIncorrect && styles.incorrectOption,
                  (isLoading || !!selectedAnswer) && styles.disabledOption
                ]}
                onPress={() => handleAnswerPress(option)}
                disabled={isLoading || !!selectedAnswer}
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

      {isLoading && <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 20 }} />}

      <Text style={styles.instruction}>
        {isLoading ? 'Sprawdzanie odpowiedzi...' : 'Kliknij odpowiedź lub przejdź do innego pytania'}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
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
  instruction: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});