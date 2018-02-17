window.Genki = {
  problems : 0, // number of problems to solve in the lesson
    solved : 0, // number of problems solved
  mistakes : 0, // number of mistakes made in the lesson
  score : 0, // the student's score
  
  // frequently used strings
  lang : {
    std_drag : 'Read the Japanese on the left and match the correct meaning by dragging an answer from the right.',
    std_kana : 'Drag the Kana to the matching Romaji.',
    mistakes : 'The items outlined in red were answered wrong before finding the correct answer. Review these problems before trying again.'
  }
};


// scroll to the specified element
function scrollTo (el) {
  window.setTimeout(function () {
    document.body.scrollTop = el.offsetTop;
    document.documentElement.scrollTop = el.offsetTop;
  }, 100);
};


// To generate a quiz simply pass an object with the necessary data (see vocab-1/index.html and other quiz files for examples)
function generateQuiz (o) {
  
  // create a drag and drop quiz
  if (o.type == 'drag') {
    var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list">',
        dropList = '<div id="drop-list">',
        keysQ = [],
        keysA,
        i;
    
    // generate a key list for the quizlet so we can randomly sort questions and answers
    for (i in o.quizlet) {
      keysQ.push(i);
    }
    keysA = keysQ.slice(0);
    
    // generate the questions
    while (keysQ.length) {
      i = Math.floor(Math.random() * keysQ.length);
      quiz += '<div class="quiz-item">' + keysQ[i] + '</div>';
      dropList += '<div class="quiz-answer-zone" data-text="' + keysQ[i] + '" data-mistakes="0"></div>';
      keysQ.splice(i, 1);
      ++Genki.problems;
    }
    quiz += '</div>' + dropList + '</div>'; // close the question list and add the drop list
    
    
    // generate the answers
    quiz += '<div id="answer-list">';
    while (keysA.length) {
      i = Math.floor(Math.random() * keysA.length);
      quiz += '<div class="quiz-item" data-answer="' + keysA[i] + '">' + o.quizlet[keysA[i]] + '</div>';
      keysA.splice(i, 1);
    }
    quiz += '</div>'; // close the answer list
    
    document.getElementById('quiz-zone').innerHTML = quiz;
    
    // setup drag and drop
    var drake = dragula([document.querySelector('#answer-list')], {
      isContainer : function (el) {
        return el.classList.contains('quiz-answer-zone');
      }
    });

    drake.on('drop', function (el, target, source) {
      if (target.parentNode.id == 'drop-list'){
        if (el.dataset.answer != target.dataset.text) {
          document.getElementById('answer-list').append(el);

          target.dataset.mistakes = ++target.dataset.mistakes;
          ++Genki.mistakes;

        } else {
          target.className += ' answer-correct';

          // when all problems have been solved..
          // stop the timer, show the score, and congratulate the student
          if (++Genki.solved == Genki.problems) {
            endQuiz();
          }
        }
      }
    });
  }
  
  
  // create a kana drag game
  if (o.type == 'kana') {
    var zone = document.getElementById('quiz-zone'),
        quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list" class="clear">',
        answers = '<div id="answer-list">',
        kanaList = [],
        kana = o.quizlet,
        i = kana.length - 1,
        k;
    
    // create the columns for the student to drop the kana into
    for (; i > -1; i--) {
      quiz += '<div class="quiz-column">';
      
      for (k in kana[i]) {
        
        quiz += 
        '<div class="quiz-item-row">'+
          '<div class="quiz-answer-zone" data-text="' + kana[i][k] + '" data-mistakes="0"></div>'+
          '<div class="quiz-item">' + kana[i][k] + '</div>'+
        '</div>';
        
        kanaList.push('<div class="quiz-item" data-answer="' + kana[i][k] + '">' + k + '</div>'); // put the kana into an array for later..
        ++Genki.problems;
      }
      
      quiz += '</div>';
    }
    
    // randomize the kana order, so the student cannot memorize the locations
    while (kanaList.length) {
      i = Math.floor(Math.random() * kanaList.length)
      answers += kanaList[i];
      kanaList.splice(i, 1);
    }

    // add the kana list to the quiz zone
    zone.innerHTML = quiz + '</div>' + answers + '</div>';
    zone.className += ' kana-quiz'; // change the quiz styles
    
    // setup drag and drop
    var drake = dragula([document.querySelector('#answer-list')], {
      isContainer : function (el) {
        return el.classList.contains('quiz-answer-zone');
      }
    });

    drake.on('drop', function (el, target, source) {
      if (target.parentNode.className == 'quiz-item-row'){
        if (el.dataset.answer != target.dataset.text) {
          document.getElementById('answer-list').append(el);

          target.dataset.mistakes = ++target.dataset.mistakes;
          ++Genki.mistakes;

        } else {
          target.className += ' answer-correct';

          // when all problems have been solved..
          // stop the timer, show the score, and congratulate the student
          if (++Genki.solved == Genki.problems) {
            endQuiz();
          }
        }
      }
    });
  }
  
  
  // setup timer
  var timer = new Timer(),
      clock = document.getElementById('quiz-timer');
  
  clock.innerHTML = '00:00:00';
  timer.start();
  timer.addEventListener('secondsUpdated', function (e) {
    clock.innerHTML = timer.getTimeValues().toString()
  });
  
  Genki.timer = timer;
  Genki.drake = drake;
  
  // jump to the quiz info
  scrollTo(document.getElementById('quiz-info'));
};


// ends the quiz
function endQuiz () {
  Genki.score = Math.floor((Genki.solved - Genki.mistakes) * 100 / Genki.problems);
  Genki.timer.stop();

  var timer = document.getElementById('quiz-timer');

  timer.style.display = 'none';

  document.getElementById('quiz-result').innerHTML = 
  '<div id="complete-banner" class="center">Quiz Complete!</div>'+
  '<div id="result-list">'+
    '<div class="result-row"><span class="result-label">Problems Solved:</span>' + Genki.problems + '</div>'+
    '<div class="result-row"><span class="result-label">Answers Wrong:</span>' + Genki.mistakes + '</div>'+
    '<div class="result-row"><span class="result-label">Score:</span>' + Genki.score + '%</div>'+
    '<div class="result-row"><span class="result-label">Completion Time:</span>' + timer.innerHTML + '</div>'+
    '<div class="result-row center">'+
      (
        Genki.score == 100 ? 'PERFECT! Great Job, you have mastered this quiz! Feel free to move on or challenge yourself by trying to beat your completion time.' :
        Genki.score > 70 ? 'Nice work! ' + Genki.lang.mistakes :
        'Keep studying! ' + Genki.lang.mistakes
      )+
      '<div class="center">'+
        '<a href="' + window.location.pathname + '" class="button">Try Again</a>'+
        '<a href="' + document.getElementById('home-link').href + '" class="button">Back to Index</a>'+
      '</div>'+
    '</div>'+
  '</div>';

  document.getElementById('quiz-zone').className += ' quiz-over';
  scrollTo(document.getElementById('complete-banner')); // jump to the quiz results
};


// append index.html to links if this project is hosted on the local file system
if (window.location.protocol == 'file:') {
  for (var a = document.querySelectorAll('a[href$="/"]'), i = 0, j = a.length; i < j; i++) {
    if (!/http/.test(a[i].href)) {
      a[i].href += 'index.html';
    }
  }
}