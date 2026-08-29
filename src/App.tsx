import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Gift, Heart, Headphones, LockKeyhole, Music2, Pause, PenLine, Play, RotateCcw, Star, Volume2, VolumeX } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ CONFIG — edit this little section to make the keepsake yours.             │
// │ Names, message, music, and button labels are intentionally easy to find.  │
// └─────────────────────────────────────────────────────────────────────────┘
const CONFIG = {
  yourName: 'M.',
  theirName: 'my favorite person',
  openingKicker: 'a small, lavender-colored thing',
  openingTitle: 'Our love story,',
  openingEmphasis: 'in chapters.',
  openingMessage: 'A few questions, one tiny surprise, and a letter I have been carrying around in my heart.',
  startButton: 'Open our story',
  testTitle: 'A very serious test of us.',
  testIntro: 'No pressure. The right answers are the ones that make you smile before you choose them.',
  giftTitle: 'There is something inside.',
  giftIntro: 'Three little doors. One of them is keeping a secret for you.',
  giftContinue: 'Keep the secret',
  letterTitle: 'A note for you.',
  letterGreeting: 'Dear you,',
  loveMessage: 'Somehow, ordinary days became my favorite days. A walk, a message, the way you look over when something makes you laugh — you make a home out of the smallest moments. I love the life we are making in the margins, and I love finding new reasons to choose you.',
  letterSignoff: 'Always, M.',
  endingTitle: 'Still choosing',
  endingEmphasis: 'you.',
  endingMessage: 'Thank you for being my favorite plot twist, my soft place to land, and the person I want beside me for every next chapter.',
  replayButton: 'Read it again',
  musicTitle: 'Sweet Boy',
  musicNote: 'a little soundtrack for us',
};

type Screen = 'welcome' | 'test' | 'result' | 'gift' | 'letter' | 'ending';
const QUESTIONS = [
  { question: 'What is my favorite version of us?', answers: ['The one laughing at nothing', 'The one dressed up for somewhere fancy', 'The one quietly sharing a snack'], correct: 0 },
  { question: 'Which tiny thing makes my whole day?', answers: ['A perfectly timed message', 'When you steal the blanket', 'A surprise grand gesture'], correct: 0 },
  { question: 'Where would I choose to meet you again?', answers: ['At the beginning, with butterflies', 'At our favorite table', 'On the next adventure'], correct: 2 },
  { question: 'What do I hope you always know?', answers: ['You are easy to love', 'I notice all the little things', 'Both, and then some'], correct: 2 },
];

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedApp />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RoutedApp() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={LoveStory} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function Decorations() {
  return <div aria-hidden="true">
    <div className="heart-shape" style={{ top: '15%', left: '7%', animationDelay: '.4s' }} />
    <div className="heart-shape" style={{ top: '54%', right: '7%', width: 14, height: 14, animationDelay: '1.8s' }} />
    <div className="heart-shape" style={{ bottom: '13%', left: '28%', width: 10, height: 10, animationDelay: '3.1s' }} />
    <div className="spark" style={{ top: '12%', right: '19%', animationDelay: '.7s' }} />
    <div className="spark" style={{ top: '38%', left: '16%', width: 5, height: 5, animationDelay: '1.4s' }} />
    <div className="spark" style={{ bottom: '23%', right: '28%', width: 5, height: 5, animationDelay: '2.1s' }} />
  </div>;
}

function LoveStory() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [giftChoice, setGiftChoice] = useState<number | null>(null);
  const go = (next: Screen) => { setScreen(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const beginTest = () => { setQuestionIndex(0); setAnswers([]); go('test'); };
  const answerQuestion = (answerIndex: number) => {
    const nextAnswers = [...answers, answerIndex];
    setAnswers(nextAnswers);
    if (questionIndex < QUESTIONS.length - 1) window.setTimeout(() => setQuestionIndex((current) => current + 1), 220);
    else {
      const correctAnswers = nextAnswers.reduce((total, answer, index) => total + (answer === QUESTIONS[index].correct ? 1 : 0), 0);
      setScore(Math.round((correctAnswers / QUESTIONS.length) * 100));
      window.setTimeout(() => go('result'), 300);
    }
  };
  const resetStory = () => { setGiftChoice(null); setQuestionIndex(0); setAnswers([]); setScore(0); go('welcome'); };
  return <main className="love-app">
    <Decorations />
    <div className="top-mark"><span className="mark-dot" /> {CONFIG.yourName} <span>/</span> {CONFIG.theirName}</div>
    <div key={screen} className="screen-shell">
      {screen === 'welcome' && <Welcome onStart={beginTest} />}
      {screen === 'test' && <LoveTest questionIndex={questionIndex} answers={answers} onAnswer={answerQuestion} onBack={() => go('welcome')} />}
      {screen === 'result' && <Result score={score} onContinue={() => go('gift')} />}
      {screen === 'gift' && <GiftReveal choice={giftChoice} onChoose={setGiftChoice} onContinue={() => go('letter')} />}
      {screen === 'letter' && <Letter onContinue={() => go('ending')} />}
      {screen === 'ending' && <Ending onReplay={resetStory} />}
    </div>
    <MusicPlayer />
  </main>;
}

function Welcome({ onStart }: { onStart: () => void }) {
  const [photoMissing, setPhotoMissing] = useState(false);
  return <section className="welcome-grid" data-testid="screen-welcome">
    <div className="welcome-copy">
      <div className="eyebrow">{CONFIG.openingKicker}</div>
      <h1 className="display">{CONFIG.openingTitle}<br /><em>{CONFIG.openingEmphasis}</em></h1>
      <p className="quiet-copy intro">{CONFIG.openingMessage}</p>
      <button className="primary-cta" onClick={onStart} data-testid="button-start-story">{CONFIG.startButton} <ArrowRight size={15} strokeWidth={2.4} /></button>
      <div className="welcome-footnote"><LockKeyhole size={13} /> for one very specific person</div>
    </div>
    <div className="keepsake" aria-label="A handwritten keepsake preview">
      <div className="paper-tape" />
      <article className="keepsake-paper"><div className="keepsake-inner">
        <div className="mini-date">VOL. 01 / THE LITTLE THINGS</div>
        <h2 className="display">A collection<br />of us.</h2>
        <p>For the inside jokes, the long looks, the “text me when you get home”s.</p>
        <div className="keepsake-stamp">LAVENDER<br />LOVE<br />ARCHIVE</div>
      </div></article>
      <div className="photo-collage">
        {photoMissing ? <div className="photo-fallback"><span>Our favorite<br />memory goes here</span></div> : <img src="assets/second-picture.jpg" alt="A replaceable romantic memory" onError={() => setPhotoMissing(true)} data-testid="img-second-picture" />}
        <span className="photo-caption">one of my favorite days</span>
      </div>
    </div>
  </section>;
}

function LoveTest({ questionIndex, answers, onAnswer, onBack }: { questionIndex: number; answers: number[]; onAnswer: (index: number) => void; onBack: () => void }) {
  const question = QUESTIONS[questionIndex];
  const progress = ((questionIndex + (answers.length > questionIndex ? 1 : 0)) / QUESTIONS.length) * 100;
  return <section className="test-shell" data-testid="screen-love-test">
    <div className="progress-line"><button className="ghost-cta" onClick={onBack} data-testid="button-back-to-welcome"><ArrowLeft size={14} /> back</button><span>chapter 01 <b>{String(questionIndex + 1).padStart(2, '0')} / {String(QUESTIONS.length).padStart(2, '0')}</b></span></div>
    <div className="progress-track" aria-label={`Question ${questionIndex + 1} of ${QUESTIONS.length}`}><div className="progress-fill" style={{ width: `${Math.max(25, progress)}%` }} /></div>
    <article className="question-card" style={{ marginTop: 32 }}>
      <div className="eyebrow">the love test</div>
      <h1 className="display">{question.question}</h1>
      <p className="quiet-copy" style={{ marginTop: -20, marginBottom: 26 }}>{CONFIG.testIntro}</p>
      <div className="answer-stack">{question.answers.map((answer, index) => <button className="answer-button" key={answer} onClick={() => onAnswer(index)} data-testid={`button-answer-${questionIndex}-${index}`}><span className="key">{String.fromCharCode(65 + index)}</span><span className="answer-text">{answer}</span><ChevronRight size={16} /></button>)}</div>
    </article>
  </section>;
}

function Result({ score, onContinue }: { score: number; onContinue: () => void }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    let current = 0;
    const timer = window.setInterval(() => { current += 2; setAnimatedScore(Math.min(score, current)); if (current >= score) window.clearInterval(timer); }, 25);
    return () => window.clearInterval(timer);
  }, [score]);
  return <section className="result-layout" data-testid="screen-result">
    <div className="result-copy"><div className="eyebrow">the verdict is in</div><h1 className="display">You know<br /><span>the magic.</span></h1><p className="quiet-copy result-note">Not because you remembered every answer. Because you remember how it feels to be us.</p><button className="primary-cta" onClick={onContinue} data-testid="button-continue-to-gift">There is more <ArrowRight size={15} /></button></div>
    <div className="result-score" style={{ '--score': `${animatedScore * 3.6}deg` } as React.CSSProperties} data-testid="status-love-score"><div className="result-score-inner"><div className="result-score-number">{animatedScore}<span style={{ fontSize: '.42em' }}>%</span></div><div className="result-score-label">love compatibility</div></div></div>
  </section>;
}

function GiftReveal({ choice, onChoose, onContinue }: { choice: number | null; onChoose: (choice: number) => void; onContinue: () => void }) {
  const labels = ['the day we met', 'a small forever', 'one more secret'];
  return <section className="gift-layout" data-testid="screen-gift">
    <div className="eyebrow" style={{ justifyContent: 'center' }}><Gift size={13} /> chapter 02 / the surprise</div>
    <h1 className="display">{CONFIG.giftTitle}</h1><p className="quiet-copy sub">{CONFIG.giftIntro}</p>
    <div className="gift-row">{labels.map((label, index) => <div className={`gift-choice ${choice === index && index === 1 ? 'correct' : ''}`} key={label}><button onClick={() => onChoose(index)} aria-label={`Open ${label}`} data-testid={`button-gift-${index}`}><span className="gift-lid" /><span className="gift-body" /><span className="gift-ribbon-v" /><span className="gift-ribbon-h" /></button><span className="gift-label">{label}</span></div>)}</div>
    <div className="gift-feedback" data-testid="status-gift-feedback">{choice === null && <span>Choose carefully.</span>}{choice !== null && choice !== 1 && <span>Almost. That one is a lovely thought, but try another.</span>}{choice === 1 && <span><Check size={14} style={{ verticalAlign: 'middle' }} /> You found the little forever.</span>}</div>
    <div style={{ marginTop: 26, minHeight: 49 }}>{choice === 1 && <button className="primary-cta" onClick={onContinue} data-testid="button-continue-to-letter">{CONFIG.giftContinue} <ArrowRight size={15} /></button>}</div>
  </section>;
}

function Letter({ onContinue }: { onContinue: () => void }) {
  return <section className="letter-layout" data-testid="screen-letter">
    <div className="letter-intro"><div className="eyebrow"><PenLine size={13} /> chapter 03 / in my handwriting</div><h1 className="display">{CONFIG.letterTitle}</h1><p className="script-note">No edits. Just the truth.</p></div>
    <article className="letter-card"><div className="letter-content"><h2>{CONFIG.letterGreeting}</h2><p data-testid="text-love-message">{CONFIG.loveMessage}</p><div className="letter-sign">{CONFIG.letterSignoff}</div><button className="primary-cta" onClick={onContinue} style={{ marginTop: 28 }} data-testid="button-continue-to-ending">Turn the page <ArrowRight size={15} /></button></div></article>
  </section>;
}

function Ending({ onReplay }: { onReplay: () => void }) {
  return <section className="ending-shell centered" data-testid="screen-ending"><div><div className="glowing-heart"><Heart size={23} fill="currentColor" strokeWidth={1.5} /></div><div className="eyebrow" style={{ justifyContent: 'center', marginTop: 39 }}>the last page, for now</div><h1 className="display">{CONFIG.endingTitle}<br /><span>{CONFIG.endingEmphasis}</span></h1><p className="quiet-copy ending-copy">{CONFIG.endingMessage}</p><div className="ending-actions"><button className="primary-cta" onClick={onReplay} data-testid="button-replay-story"><RotateCcw size={14} /> {CONFIG.replayButton}</button><button className="ghost-cta" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-testid="button-back-to-top"><Star size={14} /> keep this close</button></div></div></section>;
}

function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(.72);
  const [coverMissing, setCoverMissing] = useState(false);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const setMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const ended = () => setPlaying(false);
    audio.addEventListener('timeupdate', updateTime); audio.addEventListener('loadedmetadata', setMeta); audio.addEventListener('ended', ended); audio.volume = volume;
    return () => { audio.removeEventListener('timeupdate', updateTime); audio.removeEventListener('loadedmetadata', setMeta); audio.removeEventListener('ended', ended); };
  }, [volume]);
  const togglePlayback = async () => {
    const audio = audioRef.current; if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); } else { try { await audio.play(); setPlaying(true); } catch { setPlaying(false); } }
  };
  const changeTime = (value: string) => { const nextTime = Number(value); setCurrentTime(nextTime); if (audioRef.current) audioRef.current.currentTime = nextTime; };
  const changeVolume = (value: string) => { const nextVolume = Number(value); setVolume(nextVolume); if (audioRef.current) audioRef.current.volume = nextVolume; };
  const formatTime = (time: number) => Number.isFinite(time) ? `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}` : '0:00';
  return <aside className="audio-dock" data-testid="audio-player">
    <audio ref={audioRef} src="assets/music/song.mp3" preload="metadata" />
    <div className={`cover-wrap ${playing ? 'is-playing' : ''}`}>{coverMissing ? <div className="cover-fallback"><Music2 size={20} /></div> : <img src="assets/music-cover.jpg" alt="Sweet Boy cover" onError={() => setCoverMissing(true)} data-testid="img-music-cover" />}</div>
    <div className="track-meta"><div className="track-kicker"><Headphones size={9} style={{ verticalAlign: 'middle' }} /> now playing</div><div className="track-name">{CONFIG.musicTitle}</div></div>
    <div className="audio-main"><button className="audio-play" onClick={togglePlayback} aria-label={playing ? 'Pause Sweet Boy' : 'Play Sweet Boy'} data-testid="button-audio-play">{playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button><div className="audio-progress"><input type="range" min="0" max={duration || 100} step=".1" value={Math.min(currentTime, duration || 100)} onChange={(event) => changeTime(event.target.value)} aria-label="Song progress" data-testid="input-audio-progress" /></div><span className="time-readout">{formatTime(currentTime)} / {formatTime(duration)}</span></div>
    <div className="volume">{volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}<input type="range" min="0" max="1" step=".01" value={volume} onChange={(event) => changeVolume(event.target.value)} aria-label="Volume" data-testid="input-audio-volume" /></div>
    <span className="audio-note">{CONFIG.musicNote}</span>
  </aside>;
}

export default App;
