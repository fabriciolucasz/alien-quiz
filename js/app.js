// Starfield Animation - Dynamic Stars
function createStars(numStars = 120) {
  const starsLayer = document.getElementById('stars-layer');
  if (!starsLayer) return;
  starsLayer.innerHTML = '';
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.opacity = Math.random() * 0.7 + 0.3;
    starsLayer.appendChild(star);
  }
}

function animateStars() {
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, idx) => {
    star.animate([
      { transform: 'translateY(0px) scale(1)' },
      { transform: `translateY(${Math.sin(idx) * 8}px) scale(1.05)` },
      { transform: 'translateY(0px) scale(1)' }
    ], {
      duration: 4000 + Math.random() * 2000,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out'
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createStars();
  animateStars();
});
/**
 * Alien: Earth Quiz Application
 * Sistema de quiz orientado a objetos para descobrir personagens do universo Alien
 * 
 * @author Alien: Earth Quiz Team
 * @version 1.0.0
 * 
 * Performance Features:
 * - LocalStorage para salvar progresso
 * - Lazy loading de assets
 * - Debounced event handlers
 * - Optimized DOM operations
 */

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Debounce function para otimizar performance
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * LocalStorage manager
 */
class StorageManager {
  static save(key, data) {
    try {
      localStorage.setItem(`alienQuiz_${key}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn('Não foi possível salvar no localStorage:', error);
      return false;
    }
  }

  static load(key) {
    try {
      const data = localStorage.getItem(`alienQuiz_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Não foi possível carregar do localStorage:', error);
      return null;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(`alienQuiz_${key}`);
      return true;
    } catch (error) {
      console.warn('Não foi possível remover do localStorage:', error);
      return false;
    }
  }

  static clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('alienQuiz_'))
        .forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('Não foi possível limpar localStorage:', error);
      return false;
    }
  }
}

// ===================================
// CLASSES DE DADOS
// ===================================

/**
 * Classe que representa um personagem do universo Alien: Earth
 */
class Character {
  constructor(id, name, role, description, imagePath, traits = {}) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.description = description;
    this.imagePath = imagePath;
    this.traits = traits;
    this.score = 0;
  }

  /**
   * Adiciona pontos ao score do personagem
   * @param {number} points - Pontos a serem adicionados
   */
  addScore(points) {
    this.score += points;
  }

  /**
   * Reseta o score do personagem
   */
  resetScore() {
    this.score = 0;
  }

  /**
   * Calcula a porcentagem de compatibilidade baseada na pontuação máxima possível
   * @param {number} maxPossibleScore - Pontuação máxima possível
   * @returns {number} Porcentagem de compatibilidade
   */
  getCompatibilityPercentage(maxPossibleScore) {
    return Math.round((this.score / maxPossibleScore) * 100);
  }
}

/**
 * Classe que representa uma pergunta do quiz
 */
class Question {
  constructor(id, text, imagePath, options) {
    this.id = id;
    this.text = text;
    this.imagePath = imagePath;
    this.options = options; // Array de objetos { text, scores }
  }

  /**
   * Valida se a pergunta tem pelo menos 2 opções
   * @returns {boolean} True se válida
   */
  isValid() {
    return this.options && this.options.length >= 2;
  }
}

/**
 * Classe que representa uma opção de resposta
 */
class QuestionOption {
  constructor(text, scores) {
    this.text = text;
    this.scores = scores; // Objeto com {characterId: points}
  }
}

// ===================================
// CLASSES DE LÓGICA DE NEGÓCIO
// ===================================

/**
 * Classe responsável por gerenciar o sistema de quiz
 */
class QuizManager {
  constructor() {
    this.characters = [];
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.isCompleted = false;
    this.maxScorePerQuestion = 3; // Pontuação máxima por pergunta

    this.initializeData();
  }

  /**
   * Inicializa os dados dos personagens e perguntas
   */
  initializeData() {
    this.setupCharacters();
    this.setupQuestions();
  }

  /**
   * Configura os personagens do universo Alien: Earth (2025)
   */
  setupCharacters() {
    this.characters = [
      new Character(
        'humano',
        'Humano',
        'O Explorador',
        'Você é um Humano, curioso, adaptável e movido pela esperança. Sua força está na capacidade de aprender, se reinventar e criar laços.',
        'user',
        { curiosidade: 10, adaptabilidade: 9, empatia: 8, criatividade: 9 }
      ),
      new Character(
        'android',
        'Android',
        'O Analítico',
        'Você é um Android, lógico, eficiente e protetor. Sua missão é garantir a sobrevivência e o progresso, mesmo diante de desafios extremos.',
        'cpu',
        { logica: 10, eficiencia: 9, protecao: 8, lealdade: 9 }
      ),
      new Character(
        'sintetico',
        'Sintético',
        'O Visionário',
        'Você é um Sintético, resultado da fusão entre tecnologia e biologia. Sua visão de mundo é inovadora e busca sempre o equilíbrio entre razão e emoção.',
        'git-merge',
        { inovacao: 10, equilibrio: 9, insight: 8, adaptacao: 10 }
      ),
      new Character(
        'xenoformo',
        'Xenoformo',
        'O Instintivo',
        'Você é um Xenoformo, guiado pelo instinto, força e sobrevivência. Sua presença é misteriosa e poderosa, representando o desconhecido.',
        'alien',
        { instinto: 10, forca: 9, misterio: 8, sobrevivencia: 10 }
      )
    ];
  }

  /**
   * Configura as perguntas do quiz específicas para Alien: Earth (2025)
   */
  setupQuestions() {
    this.questions = [
      new Question(1, 'A Terra foi invadida pelos Xenomorfos. Você ouve gritos vindos de um prédio próximo. Qual é sua reação?', null, [
        new QuestionOption('Corro para ajudar, mesmo sabendo do perigo', { humano: 3, android: 1, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Analiso a situação e planejo uma abordagem segura', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Confio nos meus instintos e ajo rapidamente', { humano: 2, android: 1, sintetico: 1, xenoformo: 3 }),
        new QuestionOption('Busco uma solução inovadora para salvar todos', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 })
      ]),
      new Question(2, 'Você encontra um sobrevivente ferido. Ele pode estar infectado. O que faz?', null, [
        new QuestionOption('Ajudo imediatamente, toda vida vale o risco', { humano: 3, android: 1, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Faço uma análise médica completa antes de agir', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Confio na minha percepção única', { humano: 2, android: 1, sintetico: 1, xenoformo: 3 }),
        new QuestionOption('Procuro uma solução inovadora para ajudar sem risco', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 })
      ]),
      new Question(3, 'Sua equipe está dividida sobre uma decisão importante. Como você reage?', null, [
        new QuestionOption('Defendo minha opinião e tento convencer os outros', { humano: 3, android: 1, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Apresento dados e deixo a lógica prevalecer', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Procuro um meio-termo para todos', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 }),
        new QuestionOption('Sigo meu instinto, mesmo que seja incompreendido', { humano: 1, android: 1, sintetico: 1, xenoformo: 3 })
      ]),
      new Question(4, 'Você está enfrentando um dilema moral difícil. Como toma sua decisão?', null, [
        new QuestionOption('Priorizo a proteção das pessoas', { humano: 3, android: 2, sintetico: 1, xenoformo: 1 }),
        new QuestionOption('Analiso friamente os prós e contras', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Sigo meu coração', { humano: 2, android: 1, sintetico: 1, xenoformo: 3 }),
        new QuestionOption('Busco equilíbrio entre razão e emoção', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 })
      ]),
      new Question(5, 'Em perigo extremo, qual é sua maior força?', null, [
        new QuestionOption('Determinação e coragem', { humano: 3, android: 1, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Pensar claramente sob pressão', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Adaptar-se rapidamente', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 }),
        new QuestionOption('Instinto de sobrevivência', { humano: 1, android: 1, sintetico: 1, xenoformo: 3 })
      ]),
      new Question(6, 'Como lida com solidão e isolamento?', null, [
        new QuestionOption('Foco nas responsabilidades e proteção', { humano: 3, android: 2, sintetico: 1, xenoformo: 1 }),
        new QuestionOption('Otimizo sistemas e processos', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Reflexão profunda sobre existência', { humano: 2, android: 1, sintetico: 1, xenoformo: 3 }),
        new QuestionOption('Busco inovação para superar desafios', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 })
      ]),
      new Question(7, 'Como lida com tecnologia alienígena desconhecida?', null, [
        new QuestionOption('Cautela extrema, verifico riscos', { humano: 3, android: 2, sintetico: 1, xenoformo: 1 }),
        new QuestionOption('Análise sistemática e estudo', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Intuição natural', { humano: 2, android: 1, sintetico: 1, xenoformo: 3 }),
        new QuestionOption('Busco inovação para compreender', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 })
      ]),
      new Question(8, 'Se pudesse escolher uma habilidade especial, qual seria?', null, [
        new QuestionOption('Resistência física e mental', { humano: 3, android: 1, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Processar e armazenar informações infinitamente', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Compreender e se comunicar com qualquer forma de vida', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 }),
        new QuestionOption('Instinto de adaptação', { humano: 1, android: 1, sintetico: 1, xenoformo: 3 })
      ]),
      new Question(9, 'Em uma emergência, qual seria seu papel ideal?', null, [
        new QuestionOption('Líder que protege a equipe', { humano: 3, android: 2, sintetico: 1, xenoformo: 1 }),
        new QuestionOption('Especialista técnico', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('Mediador inovador', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 }),
        new QuestionOption('Instintivo, encontra caminhos únicos', { humano: 1, android: 1, sintetico: 1, xenoformo: 3 })
      ]),
      new Question(10, 'Qual frase melhor descreve sua filosofia de vida?', null, [
        new QuestionOption('"Sobreviver não é suficiente - devemos proteger todos"', { humano: 3, android: 1, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('"A lógica e o conhecimento são as ferramentas mais poderosas"', { humano: 1, android: 3, sintetico: 2, xenoformo: 1 }),
        new QuestionOption('"Existe beleza e propósito na união entre mundos"', { humano: 2, android: 2, sintetico: 3, xenoformo: 1 }),
        new QuestionOption('"O instinto é a chave para a sobrevivência"', { humano: 1, android: 1, sintetico: 1, xenoformo: 3 })
      ])
    ];
  }
  // ...existing code...

  /**
   * Obtém a pergunta atual
   * @returns {Question|null} Pergunta atual ou null se não houver mais perguntas
   */
  getCurrentQuestion() {
    if (this.currentQuestionIndex < this.questions.length) {
      return this.questions[this.currentQuestionIndex];
    }
    return null;
  }

  /**
   * Registra a resposta do usuário
   * @param {number} optionIndex - Índice da opção selecionada
   */
  answerQuestion(optionIndex) {
    const currentQuestion = this.getCurrentQuestion();
    if (currentQuestion && optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
      const selectedOption = currentQuestion.options[optionIndex];

      // Armazena a resposta
      this.userAnswers[this.currentQuestionIndex] = {
        questionId: currentQuestion.id,
        optionIndex: optionIndex,
        optionText: selectedOption.text,
        scores: selectedOption.scores
      };

      // Adiciona pontos aos personagens
      for (const [characterId, points] of Object.entries(selectedOption.scores)) {
        const character = this.getCharacterById(characterId);
        if (character) {
          character.addScore(points);
        }
      }

      // Salva progresso no localStorage
      this.saveProgress();
    }
  }

  /**
   * Salva o progresso atual no localStorage
   */
  saveProgress() {
    const progressData = {
      currentQuestionIndex: this.currentQuestionIndex,
      userAnswers: this.userAnswers,
      characterScores: this.characters.map(char => ({
        id: char.id,
        score: char.score
      })),
      timestamp: new Date().toISOString()
    };

    StorageManager.save('progress', progressData);
  }

  /**
   * Carrega o progresso salvo do localStorage
   * @returns {boolean} True se conseguiu carregar progresso
   */
  loadProgress() {
    const progressData = StorageManager.load('progress');

    if (!progressData) return false;

    try {
      this.currentQuestionIndex = progressData.currentQuestionIndex;
      this.userAnswers = progressData.userAnswers;

      // Restaura scores dos personagens
      progressData.characterScores.forEach(charData => {
        const character = this.getCharacterById(charData.id);
        if (character) {
          character.score = charData.score;
        }
      });

      return true;
    } catch (error) {
      console.warn('Erro ao carregar progresso:', error);
      return false;
    }
  }

  /**
   * Remove o progresso salvo
   */
  clearProgress() {
    StorageManager.remove('progress');
  }

  /**
   * Avança para a próxima pergunta
   * @returns {boolean} True se há mais perguntas, false se o quiz acabou
   */
  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      return true;
    } else {
      this.isCompleted = true;
      return false;
    }
  }

  /**
   * Volta para a pergunta anterior
   * @returns {boolean} True se conseguiu voltar
   */
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      // Remove a pontuação da pergunta atual antes de voltar
      this.removeCurrentQuestionScore();
      this.currentQuestionIndex--;
      return true;
    }
    return false;
  }
  // Remove a pontuação da pergunta atual antes de voltar

  /**
   * Remove a pontuação da pergunta atual dos personagens
   */
  removeCurrentQuestionScore() {
    const answer = this.userAnswers[this.currentQuestionIndex];
    if (answer) {
      for (const [characterId, points] of Object.entries(answer.scores)) {
        const character = this.getCharacterById(characterId);
        if (character) {
          character.addScore(-points); // Remove os pontos
        }
      }
      this.userAnswers[this.currentQuestionIndex] = null;
    }
  }

  /**
   * Obtém personagem por ID
   * @param {string} id - ID do personagem
   * @returns {Character|null} Personagem encontrado ou null
   */
  getCharacterById(id) {
    return this.characters.find(char => char.id === id) || null;
  }

  /**
   * Calcula o resultado final do quiz
   * @returns {Object} Objeto com resultado detalhado
   */
  calculateResult() {
    if (!this.isCompleted) {
      return null;
    }

    // Encontra o personagem com maior pontuação
    const winnerCharacter = this.characters.reduce((prev, current) =>
      current.score > prev.score ? current : prev
    );

    // Calcula pontuação máxima possível
    const maxPossibleScore = this.questions.length * this.maxScorePerQuestion;

    return {
      character: winnerCharacter,
      compatibilityPercentage: winnerCharacter.getCompatibilityPercentage(maxPossibleScore),
      allScores: this.characters.map(char => ({
        character: char,
        score: char.score,
        percentage: char.getCompatibilityPercentage(maxPossibleScore)
      })).sort((a, b) => b.score - a.score)
    };
  }

  /**
   * Reinicia o quiz
   */
  restart() {
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.isCompleted = false;

    // Reseta scores dos personagens
    this.characters.forEach(char => char.resetScore());
  }

  /**
   * Obtém o progresso atual do quiz
   * @returns {Object} Objeto com informações de progresso
   */
  getProgress() {
    return {
      current: this.currentQuestionIndex + 1,
      total: this.questions.length,
      percentage: Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100),
      completed: this.isCompleted
    };
  }

  /**
   * Verifica se há resposta para a pergunta atual
   * @returns {boolean} True se há resposta
   */
  hasCurrentAnswer() {
    return this.userAnswers[this.currentQuestionIndex] !== undefined;
  }

  /**
   * Obtém a resposta atual (se houver)
   * @returns {Object|null} Resposta atual ou null
   */
  getCurrentAnswer() {
    return this.userAnswers[this.currentQuestionIndex] || null;
  }
}


// ===================================
// VIEW (QuizView)
// ===================================
class QuizView {
  constructor() {
    // Seções principais
    this.sections = {
      loading: document.getElementById('loading-screen'),
      landing: document.getElementById('landing-section'),
      quiz: document.getElementById('quiz-section'),
      results: document.getElementById('results-section')
    };
    // Elementos do quiz
    this.quizElements = {
      progressFill: document.getElementById('progress-fill'),
      currentQuestion: document.getElementById('current-question'),
      totalQuestions: document.getElementById('total-questions'),
      questionTitle: document.getElementById('question-title'),
      questionImage: document.getElementById('question-image'),
      answersGrid: document.getElementById('answers-grid'),
      prevBtn: document.getElementById('prev-btn'),
      nextBtn: document.getElementById('next-btn'),
      nextBtnText: document.getElementById('next-btn-text'),
      exitBtn: document.getElementById('exit-quiz-btn')
    };
    // Elementos de resultado
    this.resultElements = {
      characterIcon: document.getElementById('result-character-icon'),
      characterName: document.getElementById('result-character-name'),
      characterRole: document.getElementById('result-character-role'),
      characterDescription: document.getElementById('result-character-description'),
      score: document.getElementById('result-score')
    };
    // Botões principais
    this.buttons = {
      startQuiz: document.getElementById('start-quiz-btn'),
      learnMore: document.getElementById('learn-more-btn'),
      restartQuiz: document.getElementById('restart-quiz-btn'),
      shareResult: document.getElementById('share-result-btn'),
      backHome: document.getElementById('back-home-btn')
    };
  }

  showLoadingScreen() {
    document.body.classList.add('loading');
    setTimeout(() => {
      if (this.sections.loading) {
        this.sections.loading.classList.add('hidden');
        document.body.classList.remove('loading');
      }
    }, 2000);
  }

  showSection(sectionName) {
    Object.values(this.sections).forEach(section => {
      if (section) section.classList.remove('active');
    });
    if (this.sections[sectionName]) {
      this.sections[sectionName].classList.add('active');
    }
  }

  updateTotalQuestions(total) {
    if (this.quizElements.totalQuestions) {
      this.quizElements.totalQuestions.textContent = total;
    }
  }

  updateQuizInterface(quiz) {
    const currentQuestion = quiz.getCurrentQuestion();
    if (!currentQuestion) return;
    const progress = quiz.getProgress();
    if (this.quizElements.progressFill) {
      this.quizElements.progressFill.style.width = `${progress.percentage}%`;
    }
    if (this.quizElements.currentQuestion) {
      this.quizElements.currentQuestion.textContent = progress.current;
    }
    if (this.quizElements.questionTitle) {
      this.quizElements.questionTitle.textContent = currentQuestion.text;
    }
    if (this.quizElements.questionImage && currentQuestion.imagePath) {
      this.quizElements.questionImage.src = currentQuestion.imagePath;
      this.quizElements.questionImage.style.display = 'block';
    } else if (this.quizElements.questionImage) {
      this.quizElements.questionImage.style.display = 'none';
    }
    this.updateAnswerOptions(quiz, currentQuestion);
    this.updateNavigationButtons(quiz);
  }

  updateAnswerOptions(quiz, question) {
    if (!this.quizElements.answersGrid) return;
    this.quizElements.answersGrid.innerHTML = '';
    question.options.forEach((option, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'answer-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'quiz-answer';
      input.id = `option-${index}`;
      input.value = index;
      const label = document.createElement('label');
      label.htmlFor = `option-${index}`;
      label.textContent = option.text;
      const currentAnswer = quiz.getCurrentAnswer();
      if (currentAnswer && currentAnswer.optionIndex === index) {
        input.checked = true;
      }
      input.addEventListener('change', () => {
        quiz.answerQuestion(index);
        this.updateNavigationButtons(quiz);
      });
      optionDiv.appendChild(input);
      optionDiv.appendChild(label);
      this.quizElements.answersGrid.appendChild(optionDiv);
    });
  }

  updateNavigationButtons(quiz) {
    const progress = quiz.getProgress();
    const hasAnswer = quiz.hasCurrentAnswer();
    if (this.quizElements.prevBtn) {
      this.quizElements.prevBtn.disabled = progress.current === 1;
    }
    if (this.quizElements.nextBtn) {
      this.quizElements.nextBtn.disabled = !hasAnswer;
      if (this.quizElements.nextBtnText) {
        if (progress.current === progress.total) {
          this.quizElements.nextBtnText.textContent = 'Ver Resultado →';
        } else {
          this.quizElements.nextBtnText.textContent = 'Próxima →';
        }
      }
    }
  }

  showResults(result) {
    if (!result) return;
    if (this.resultElements.characterIcon) {
      this.resultElements.characterIcon.setAttribute('data-lucide', result.character.imagePath);
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
    if (this.resultElements.characterName) {
      this.resultElements.characterName.textContent = result.character.name;
    }
    if (this.resultElements.characterRole) {
      this.resultElements.characterRole.textContent = result.character.role;
    }
    if (this.resultElements.characterDescription) {
      this.resultElements.characterDescription.textContent = result.character.description;
    }
    if (this.resultElements.score) {
      this.resultElements.score.textContent = `${result.compatibilityPercentage}%`;
    }
    // Volta para a landing-page e exibe o modal centralizado
    this.showSection('landing');
    setTimeout(() => {
      const modal = document.getElementById('result-modal');
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
      }
      const closeBtn = document.getElementById('close-result-modal');
      if (closeBtn) {
        closeBtn.onclick = () => {
          modal.classList.add('hidden');
          modal.style.display = '';
        };
      }
    }, 100);
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-primary);
            color: var(--color-bg-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// ===================================
// CONTROLLER (QuizController)
// ===================================
class QuizController {
  constructor() {
    this.quiz = new QuizManager();
    this.view = new QuizView();
    this.currentSection = 'landing';
    this.attachEventListeners();
    this.view.showLoadingScreen();
  }

  attachEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.target.getAttribute('data-section');
        this.navigateToSection(section);
      });
    });
    if (this.view.buttons.startQuiz) {
      this.view.buttons.startQuiz.addEventListener('click', () => this.startQuiz());
    }
    if (this.view.buttons.learnMore) {
      this.view.buttons.learnMore.addEventListener('click', () => this.showCharacterInfo());
    }
    if (this.view.quizElements.prevBtn) {
      this.view.quizElements.prevBtn.addEventListener('click', () => this.previousQuestion());
    }
    if (this.view.quizElements.nextBtn) {
      this.view.quizElements.nextBtn.addEventListener('click', () => this.nextQuestion());
    }
    if (this.view.quizElements.exitBtn) {
      this.view.quizElements.exitBtn.addEventListener('click', () => this.exitQuiz());
    }
    if (this.view.buttons.restartQuiz) {
      this.view.buttons.restartQuiz.addEventListener('click', () => this.restartQuiz());
    }
    if (this.view.buttons.shareResult) {
      this.view.buttons.shareResult.addEventListener('click', () => this.shareResult());
    }
    if (this.view.buttons.backHome) {
      this.view.buttons.backHome.addEventListener('click', () => this.goHome());
    }
    document.querySelectorAll('.character-card').forEach(card => {
      card.addEventListener('click', () => {
        const characterId = card.getAttribute('data-character');
        this.showCharacterDetail(characterId);
      });
    });
  }

  navigateToSection(sectionType) {
    if (sectionType === 'landing') {
      if (this.currentSection !== 'landing') {
        this.view.showSection('landing');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionType === 'about') {
      if (this.currentSection !== 'landing') {
        this.view.showSection('landing');
      }
      setTimeout(() => {
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (sectionType === 'characters') {
      if (this.currentSection !== 'landing') {
        this.view.showSection('landing');
      }
      setTimeout(() => {
        const charactersSection = document.querySelector('.characters-preview');
        if (charactersSection) {
          charactersSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  startQuiz() {
    const hasProgress = this.quiz.loadProgress();
    if (hasProgress && this.quiz.currentQuestionIndex > 0) {
      if (confirm('Encontramos um quiz em andamento. Deseja continuar de onde parou?')) {
        this.view.showSection('quiz');
        this.view.updateQuizInterface(this.quiz);
        this.view.updateTotalQuestions(this.quiz.questions.length);
        this.view.showNotification('Quiz restaurado com sucesso!');
        return;
      }
    }
    this.quiz.restart();
    this.quiz.clearProgress();
    this.view.showSection('quiz');
    this.view.updateQuizInterface(this.quiz);
    this.view.updateTotalQuestions(this.quiz.questions.length);
  }

  nextQuestion() {
    if (!this.quiz.hasCurrentAnswer()) return;
    const hasMore = this.quiz.nextQuestion();
    if (hasMore) {
      this.view.updateQuizInterface(this.quiz);
    } else {
      // Quiz completed: clear progress and show results
      this.quiz.clearProgress();
      this.view.showResults(this.quiz.calculateResult());
      // Add listeners for modal actions
      const modal = document.getElementById('result-modal');
      if (modal) {
        // 'Fazer novamente' button
        const restartBtn = document.getElementById('restart-quiz-btn');
        if (restartBtn) {
          restartBtn.onclick = () => {
            modal.classList.add('hidden');
            this.startQuiz();
          };
        }
        // 'Compartilhar' button
        const shareBtn = document.getElementById('share-result-btn');
        if (shareBtn) {
          shareBtn.onclick = () => {
            this.shareResult();
          };
        }
        // 'Voltar para Home' button
        const backHomeBtn = document.getElementById('back-home-btn');
        if (backHomeBtn) {
          backHomeBtn.onclick = () => {
            modal.classList.add('hidden');
            this.goHome();
          };
        }
      }
    }
  }

  previousQuestion() {
    const canGoBack = this.quiz.previousQuestion();
    if (canGoBack) {
      this.view.updateQuizInterface(this.quiz);
    }
  }

  exitQuiz() {
    if (confirm('Tem certeza que deseja sair do quiz? Seu progresso será perdido.')) {
      this.goHome();
    }
  }

  restartQuiz() {
    this.startQuiz();
  }

  goHome() {
    this.view.showSection('landing');
  }

  showCharacterInfo() {
    const charactersSection = document.querySelector('.characters-preview');
    if (charactersSection) {
      charactersSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  showCharacterDetail(characterId) {
    const character = this.quiz.getCharacterById(characterId);
    if (character) {
      alert(`${character.name} - ${character.role}\n\n${character.description}`);
    }
  }

  shareResult() {
    // Implementar lógica de compartilhamento futuramente
    this.view.showNotification('Função de compartilhamento em breve!');
  }
}

// ===================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================

/**
 * Inicializa a aplicação quando o DOM estiver carregado
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o controller principal
  const controller = new QuizController();
  // Adiciona animações CSS para notificações
  const style = document.createElement('style');
  style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
  document.head.appendChild(style);
  // Log de inicialização (remover em produção)
  console.log('Alien: Earth Quiz inicializado com sucesso.');
  console.log('Personagens carregados:', controller.quiz.characters.length);
  console.log('Perguntas carregadas:', controller.quiz.questions.length);
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

// ===================================
// EXPORTAÇÕES (se usando módulos)
// ===================================

// Caso futuramente queira usar módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Character,
    Question,
    QuestionOption,
    QuizManager,
    UIManager
  };
}
