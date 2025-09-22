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
        'survivor',
        'Sobrevivente Terrestre',
        'O Resistente',
        'Você é uma pessoa resiliente que se adaptou à nova realidade pós-invasão. Como um Sobrevivente Terrestre da série Alien: Earth, você desenvolveu habilidades de sobrevivência excepcionais e uma determinação férrea para proteger a humanidade. Sua experiência em combate contra os Xenomorfos fez de você um líder natural entre os resistentes.',
        'shield',
        { courage: 9, survival: 10, leadership: 8, adaptability: 7 }
      ),
      new Character(
        'synthetic',
        'Androide Weyland',
        'O Protetor Sintético',
        'Você é um ser sintético avançado da Weyland Corporation, programado para proteger a humanidade durante a invasão alienígena. Como um Androide da série Alien: Earth, você possui uma lógica impecável e habilidades de combate superiores, mas também desenvolveu uma compreensão profunda sobre o valor da vida humana e a importância da preservação da espécie.',
        'cpu',
        { logic: 10, protection: 9, efficiency: 8, loyalty: 9 }
      ),
      new Character(
        'hybrid',
        'Híbrido Evoluído',
        'O Adaptado',
        'Você é resultado da evolução natural entre humano e Xenomorph na Terra. Como um Híbrido da série Alien: Earth, você possui a inteligência humana combinada com as habilidades físicas alienígenas. Esta dualidade lhe permite compreender ambos os lados do conflito e buscar soluções que outros não conseguem ver, sendo uma ponte entre dois mundos.',
        'git-merge',
        { evolution: 10, duality: 9, insight: 8, adaptation: 10 }
      )
    ];
  }

  /**
   * Configura as perguntas do quiz específicas para Alien: Earth (2025)
   */
  setupQuestions() {
    this.questions = [
      new Question(
        1,
        'A Terra foi invadida pelos Xenomorfos. Você ouve gritos vindos de um prédio próximo. Qual é sua reação?',
        null,
        [
          new QuestionOption(
            'Corro imediatamente para ajudar, mesmo sabendo do perigo',
            { survivor: 3, synthetic: 1, hybrid: 2 }
          ),
          new QuestionOption(
            'Analiso a situação e planejo uma abordagem segura e eficiente',
            { survivor: 1, synthetic: 3, hybrid: 2 }
          ),
          new QuestionOption(
            'Sinto uma conexão estranha com a situação e confio nos meus instintos',
            { survivor: 2, synthetic: 1, hybrid: 3 }
          )
        ]
      ),
      new Question(
        2,
        'Você encontra um sobrevivente ferido na Terra pós-invasão. Ele implora por ajuda, mas pode estar infectado. O que faz?',
        null,
        [
          new QuestionOption(
            'Ajudo imediatamente, toda vida humana vale o risco',
            { survivor: 3, synthetic: 1, hybrid: 2 }
          ),
          new QuestionOption(
            'Mantenho distância segura e faço uma análise médica completa primeiro',
            { survivor: 1, synthetic: 3, hybrid: 2 }
          ),
          new QuestionOption(
            'Posso sentir se há algo diferente nele, confio na minha percepção única',
            { survivor: 2, synthetic: 1, hybrid: 3 }
          )
        ]
      ),
      new Question(
        3,
        'Sua equipe está dividida sobre uma decisão importante na Terra pós-invasão. Como você reage?',
        null,
        [
          new QuestionOption(
            'Defendo firmemente minha opinião e tento convencer os outros',
            { survivor: 3, synthetic: 1, hybrid: 2 }
          ),
          new QuestionOption(
            'Apresento todos os dados e deixo que a lógica prevaleça',
            { survivor: 2, synthetic: 3, hybrid: 1 }
          ),
          new QuestionOption(
            'Procuro um meio-termo que atenda às necessidades de todos',
            { survivor: 1, synthetic: 2, hybrid: 3 }
          )
        ]
      ),
      new Question(
        4,
        'Você está enfrentando um dilema moral difícil. Como toma sua decisão?',
        null,
        [
          new QuestionOption(
            'Priorizo sempre a proteção e segurança das pessoas',
            { survivor: 3, synthetic: 2, hybrid: 1 }
          ),
          new QuestionOption(
            'Analiso friamente os prós e contras de cada opção',
            { survivor: 1, synthetic: 3, hybrid: 2 }
          ),
          new QuestionOption(
            'Sigo meu coração, mesmo que seja incompreendido',
            { survivor: 2, synthetic: 1, hybrid: 3 }
          )
        ]
      ),
      new Question(
        5,
        'Em uma situação de extremo perigo, qual é sua maior força?',
        null,
        [
          new QuestionOption(
            'Minha determinação inabalável e coragem em face do medo',
            { survivor: 3, synthetic: 1, hybrid: 2 }
          ),
          new QuestionOption(
            'Minha capacidade de pensar claramente sob pressão',
            { survivor: 2, synthetic: 3, hybrid: 1 }
          ),
          new QuestionOption(
            'Minha habilidade de me adaptar rapidamente a qualquer situação',
            { survivor: 1, synthetic: 2, hybrid: 3 }
          )
        ]
      ),
      new Question(
        6,
        'Como você lida com a solidão e o isolamento no espaço?',
        null,
        [
          new QuestionOption(
            'Foco nas minhas responsabilidades e nas pessoas que preciso proteger',
            { survivor: 3, synthetic: 2, hybrid: 1 }
          ),
          new QuestionOption(
            'Utilizo o tempo para processar informações e otimizar sistemas',
            { survivor: 1, synthetic: 3, hybrid: 2 }
          ),
          new QuestionOption(
            'Mergulho em reflexões profundas sobre minha existência',
            { survivor: 2, synthetic: 1, hybrid: 3 }
          )
        ]
      ),
      new Question(
        7,
        'Qual seria sua abordagem para lidar com uma tecnologia alienígena desconhecida?',
        null,
        [
          new QuestionOption(
            'Extrema cautela - verifico todos os riscos antes de qualquer interação',
            { survivor: 3, synthetic: 2, hybrid: 1 }
          ),
          new QuestionOption(
            'Análise sistemática - estudo cada componente metodicamente',
            { survivor: 1, synthetic: 3, hybrid: 2 }
          ),
          new QuestionOption(
            'Intuição natural - sinto que posso compreender sua natureza',
            { survivor: 2, synthetic: 1, hybrid: 3 }
          )
        ]
      ),
      new Question(
        8,
        'Se você pudesse escolher uma habilidade especial, qual seria?',
        null,
        [
          new QuestionOption(
            'Resistência física e mental extraordinária',
            { survivor: 3, synthetic: 1, hybrid: 2 }
          ),
          new QuestionOption(
            'Capacidade de processar e armazenar informações infinitamente',
            { survivor: 1, synthetic: 3, hybrid: 2 }
          ),
          new QuestionOption(
            'Habilidade de compreender e se comunicar com qualquer forma de vida',
            { survivor: 2, synthetic: 2, hybrid: 3 }
          )
        ]
      ),
      new Question(
        9,
        'Em uma emergência, qual seria seu papel ideal na equipe?',
        null,
        [
          new QuestionOption(
            'Líder que toma decisões difíceis e protege a equipe',
            { survivor: 3, synthetic: 2, hybrid: 1 }
          ),
          new QuestionOption(
            'Especialista técnico que fornece soluções precisas',
            { survivor: 1, synthetic: 3, hybrid: 2 }
          ),
          new QuestionOption(
            'Mediador que encontra caminhos alternativos únicos',
            { survivor: 2, synthetic: 1, hybrid: 3 }
          )
        ]
      ),
      new Question(
        10,
        'Qual frase melhor descreve sua filosofia de vida?',
        null,
        [
          new QuestionOption(
            '"Sobreviver não é suficiente - devemos proteger aqueles que não podem se proteger"',
            { survivor: 3, synthetic: 1, hybrid: 2 }
          ),
          new QuestionOption(
            '"A lógica e o conhecimento são as ferramentas mais poderosas do universo"',
            { survivor: 1, synthetic: 3, hybrid: 2 }
          ),
          new QuestionOption(
            '"Existe beleza e propósito na união entre mundos diferentes"',
            { survivor: 2, synthetic: 2, hybrid: 3 }
          )
        ]
      )
    ];
  }

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
   * @returns {boolean} True se foi possível voltar
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
// CLASSE DE INTERFACE E DOM
// ===================================

/**
 * Classe responsável por gerenciar a interface do usuário
 */
class UIManager {
  constructor() {
    this.currentSection = 'landing';
    this.quiz = new QuizManager();

    this.initializeElements();
    this.attachEventListeners();
    this.showLoadingScreen();
  }

  /**
   * Inicializa referências aos elementos do DOM
   */
  initializeElements() {
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

  /**
   * Anexa event listeners aos elementos
   */
  attachEventListeners() {
    // Navegação do header
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.target.getAttribute('data-section');
        this.navigateToSection(section);
      });
    });

    // Botões principais
    if (this.buttons.startQuiz) {
      this.buttons.startQuiz.addEventListener('click', () => this.startQuiz());
    }

    if (this.buttons.learnMore) {
      this.buttons.learnMore.addEventListener('click', () => this.showCharacterInfo());
    }

    // Navegação do quiz
    if (this.quizElements.prevBtn) {
      this.quizElements.prevBtn.addEventListener('click', () => this.previousQuestion());
    }

    if (this.quizElements.nextBtn) {
      this.quizElements.nextBtn.addEventListener('click', () => this.nextQuestion());
    }

    if (this.quizElements.exitBtn) {
      this.quizElements.exitBtn.addEventListener('click', () => this.exitQuiz());
    }

    // Botões de resultado
    if (this.buttons.restartQuiz) {
      this.buttons.restartQuiz.addEventListener('click', () => this.restartQuiz());
    }

    if (this.buttons.shareResult) {
      this.buttons.shareResult.addEventListener('click', () => this.shareResult());
    }

    if (this.buttons.backHome) {
      this.buttons.backHome.addEventListener('click', () => this.goHome());
    }

    // Navegação por cards de personagens
    document.querySelectorAll('.character-card').forEach(card => {
      card.addEventListener('click', () => {
        const characterId = card.getAttribute('data-character');
        this.showCharacterDetail(characterId);
      });
    });
  }

  /**
   * Navega para uma seção específica da landing page
   * @param {string} sectionType - Tipo da seção (landing, about, characters)
   */
  navigateToSection(sectionType) {
    if (sectionType === 'landing') {
      // Vai para o topo da landing page
      if (this.currentSection !== 'landing') {
        this.showSection('landing');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionType === 'about') {
      // Vai para a seção sobre na landing page
      if (this.currentSection !== 'landing') {
        this.showSection('landing');
      }
      setTimeout(() => {
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (sectionType === 'characters') {
      // Vai para a seção de personagens
      if (this.currentSection !== 'landing') {
        this.showSection('landing');
      }
      setTimeout(() => {
        const charactersSection = document.querySelector('.characters-preview');
        if (charactersSection) {
          charactersSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  /**
   * Mostra a tela de loading e depois oculta
   */
  showLoadingScreen() {
    // Adiciona classe loading ao body para impedir scroll
    document.body.classList.add('loading');

    setTimeout(() => {
      if (this.sections.loading) {
        this.sections.loading.classList.add('hidden');
        // Remove classe loading do body para permitir scroll novamente
        document.body.classList.remove('loading');
      }
    }, 2000);
  }

  /**
   * Mostra uma seção específica
   * @param {string} sectionName - Nome da seção a ser mostrada
   */
  showSection(sectionName) {
    // Oculta todas as seções
    Object.values(this.sections).forEach(section => {
      if (section) section.classList.remove('active');
    });

    // Mostra a seção solicitada
    if (this.sections[sectionName]) {
      this.sections[sectionName].classList.add('active');
      this.currentSection = sectionName;
    }
  }

  /**
   * Inicia o quiz
   */
  startQuiz() {
    // Verifica se há progresso salvo
    const hasProgress = this.quiz.loadProgress();

    if (hasProgress && this.quiz.currentQuestionIndex > 0) {
      if (confirm('Encontramos um quiz em andamento. Deseja continuar de onde parou?')) {
        this.showSection('quiz');
        this.updateQuizInterface();
        this.updateTotalQuestions();
        this.showNotification('Quiz restaurado com sucesso!');
        return;
      }
    }

    // Inicia novo quiz
    this.quiz.restart();
    this.quiz.clearProgress();
    this.showSection('quiz');
    this.updateQuizInterface();
    this.updateTotalQuestions();
  }

  /**
   * Atualiza o número total de perguntas na interface
   */
  updateTotalQuestions() {
    if (this.quizElements.totalQuestions) {
      this.quizElements.totalQuestions.textContent = this.quiz.questions.length;
    }
  }

  /**
   * Atualiza a interface do quiz
   */
  updateQuizInterface() {
    const currentQuestion = this.quiz.getCurrentQuestion();
    if (!currentQuestion) return;

    // Atualiza progress bar
    const progress = this.quiz.getProgress();
    if (this.quizElements.progressFill) {
      this.quizElements.progressFill.style.width = `${progress.percentage}%`;
    }

    if (this.quizElements.currentQuestion) {
      this.quizElements.currentQuestion.textContent = progress.current;
    }

    // Atualiza pergunta
    if (this.quizElements.questionTitle) {
      this.quizElements.questionTitle.textContent = currentQuestion.text;
    }

    // Atualiza imagem da pergunta (se houver)
    if (this.quizElements.questionImage && currentQuestion.imagePath) {
      this.quizElements.questionImage.src = currentQuestion.imagePath;
      this.quizElements.questionImage.style.display = 'block';
    } else if (this.quizElements.questionImage) {
      this.quizElements.questionImage.style.display = 'none';
    }

    // Atualiza opções
    this.updateAnswerOptions(currentQuestion);

    // Atualiza botões de navegação
    this.updateNavigationButtons();
  }

  /**
   * Atualiza as opções de resposta
   * @param {Question} question - Pergunta atual
   */
  updateAnswerOptions(question) {
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

      // Verifica se há resposta anterior
      const currentAnswer = this.quiz.getCurrentAnswer();
      if (currentAnswer && currentAnswer.optionIndex === index) {
        input.checked = true;
      }

      input.addEventListener('change', () => {
        this.quiz.answerQuestion(index);
        this.updateNavigationButtons();
      });

      optionDiv.appendChild(input);
      optionDiv.appendChild(label);
      this.quizElements.answersGrid.appendChild(optionDiv);
    });
  }

  /**
   * Atualiza os botões de navegação
   */
  updateNavigationButtons() {
    const progress = this.quiz.getProgress();
    const hasAnswer = this.quiz.hasCurrentAnswer();

    // Botão anterior
    if (this.quizElements.prevBtn) {
      this.quizElements.prevBtn.disabled = progress.current === 1;
    }

    // Botão próximo
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

  /**
   * Avança para a próxima pergunta
   */
  nextQuestion() {
    if (!this.quiz.hasCurrentAnswer()) return;

    const hasMore = this.quiz.nextQuestion();

    if (hasMore) {
      this.updateQuizInterface();
    } else {
      // Quiz completado, mostra resultados
      this.quiz.clearProgress(); // Limpa progresso ao finalizar
      this.showResults();
    }
  }

  /**
   * Volta para a pergunta anterior
   */
  previousQuestion() {
    const canGoBack = this.quiz.previousQuestion();

    if (canGoBack) {
      this.updateQuizInterface();
    }
  }

  /**
   * Sai do quiz e volta para a landing page
   */
  exitQuiz() {
    if (confirm('Tem certeza que deseja sair do quiz? Seu progresso será perdido.')) {
      this.goHome();
    }
  }

  /**
   * Mostra os resultados do quiz
   */
  showResults() {
    const result = this.quiz.calculateResult();
    if (!result) return;

    // Atualiza elementos de resultado
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

    // Exibe landing page e modal de resultado
    this.showSection('landing');
    const modal = document.getElementById('result-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }

    // Botão X para fechar modal
    const closeBtn = document.getElementById('close-result-modal');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
      };
    }
  }

  /**
   * Reinicia o quiz
   */
  restartQuiz() {
    this.startQuiz();
  }

  /**
   * Volta para a página inicial
   */
  goHome() {
    this.showSection('landing');
  }

  /**
   * Mostra informações dos personagens
   */
  showCharacterInfo() {
    // Scroll suave para a seção de personagens
    const charactersSection = document.querySelector('.characters-preview');
    if (charactersSection) {
      charactersSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Mostra detalhes de um personagem específico
   * @param {string} characterId - ID do personagem
   */
  showCharacterDetail(characterId) {
    const character = this.quiz.getCharacterById(characterId);
    if (character) {
      alert(`${character.name} - ${character.role}\n\n${character.description}`);
    }
  }

  /**
   * Mostra uma notificação temporária
   * @param {string} message - Mensagem a ser exibida
   */
  showNotification(message) {
    // Cria elemento de notificação
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

    // Remove após 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// ===================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================

/**
 * Inicializa a aplicação quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o gerenciador de UI
  const app = new UIManager();

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
  console.log('Personagens carregados:', app.quiz.characters.length);
  console.log('Perguntas carregadas:', app.quiz.questions.length);

  // Inicializa os ícones do Lucide
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
