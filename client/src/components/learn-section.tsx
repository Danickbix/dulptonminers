import { useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Server, 
  Lock, 
  Coins, 
  BarChart3, 
  Users, 
  BookOpen, 
  Layers, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Award,
  Trophy
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface LearnCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  level: "beginner" | "intermediate" | "advanced";
  onOpen: () => void;
  id: string;
  progress: number;
}

interface LessonContent {
  id: string;
  title: string;
  content: string[];
  quiz: Quiz;
}

interface Quiz {
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
}

interface UserProgress {
  [key: string]: {
    started: boolean;
    completed: boolean;
    quizScore?: number;
    lastPosition?: number;
  }
}

function LearnCard({ title, description, icon, level, onOpen, id, progress }: LearnCardProps) {
  let levelColor = "";
  
  switch (level) {
    case "beginner":
      levelColor = "bg-green-500 text-green-500";
      break;
    case "intermediate":
      levelColor = "bg-blue-500 text-blue-500";
      break;
    case "advanced":
      levelColor = "bg-purple-500 text-purple-500";
      break;
  }
  
  return (
    <Card className="bg-secondary overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className={`${levelColor} bg-opacity-10 p-2 rounded-lg`}>
            {icon}
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${levelColor} bg-opacity-10 uppercase`}>
            {level}
          </div>
        </div>
        <CardTitle className="mt-3">{title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <div className="space-y-3">
          <p className="line-clamp-3">
            Learn about {title.toLowerCase()} in an interactive way. Complete quizzes and earn points while building your knowledge.
          </p>
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant={progress > 0 ? "default" : "outline"} 
          className="w-full"
          onClick={onOpen}
        >
          {progress === 100 ? (
            <>Completed <CheckCircle2 className="ml-2 h-4 w-4" /></>
          ) : progress > 0 ? (
            <>Continue Learning <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Start Learning <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Lesson content for the "What is Blockchain?" module
const blockchainBasics: LessonContent = {
  id: "what-is-blockchain",
  title: "What is Blockchain?",
  content: [
    `# Introduction to Blockchain Technology

A blockchain is a distributed database or ledger that is shared among nodes of a computer network. As a database, a blockchain stores information electronically in digital format. Blockchains are best known for their crucial role in cryptocurrency systems, such as Bitcoin, for maintaining a secure and decentralized record of transactions. The innovation of a blockchain is that it guarantees the fidelity and security of a record of data and generates trust without the need for a trusted third party.`,

    `# Key Features of Blockchain

1. **Distributed Ledger**: All network participants have access to the distributed ledger and its immutable record of transactions.

2. **Immutable Records**: Once a transaction is recorded, no participant can change or tamper with it. If a transaction is in error, a new transaction must be added to reverse it.

3. **Smart Contracts**: A set of rules stored on the blockchain that execute automatically when predetermined conditions are met.`,

    `# How Blockchain Works

Blockchain consists of three key concepts: blocks, nodes, and miners.

**Blocks**
- Every chain consists of multiple blocks, each containing:
  - Data (e.g., transaction details)
  - A hash (unique identifier for the block)
  - Hash of the previous block (creating the chain)

**Nodes**
- Computers that maintain copies of the blockchain and keep the network functioning
- Every node has its own copy of the blockchain
- The network algorithmically approves any newly mined block

**Miners**
- Create new blocks on the chain through a process called mining
- Miners use computing power to solve complex mathematical problems
- When a block is successfully mined, it's added to the blockchain`
  ],
  quiz: {
    questions: [
      {
        question: "What is the primary purpose of blockchain technology?",
        options: [
          "To replace traditional banking systems",
          "To maintain a secure and decentralized record of transactions",
          "To increase internet speeds globally",
          "To provide free computing resources"
        ],
        correctOptionIndex: 1
      },
      {
        question: "Which of these is NOT a key feature of blockchain?",
        options: [
          "Distributed ledger",
          "Centralized control",
          "Immutable records",
          "Smart contracts"
        ],
        correctOptionIndex: 1
      },
      {
        question: "What creates the 'chain' in blockchain?",
        options: [
          "Physical connections between computers",
          "Government regulations",
          "Each block containing the hash of the previous block",
          "Social agreements between users"
        ],
        correctOptionIndex: 2
      },
      {
        question: "What is the role of miners in a blockchain network?",
        options: [
          "They physically extract cryptocurrency tokens",
          "They create new blocks through solving complex problems",
          "They hack into blockchain networks",
          "They verify user identities"
        ],
        correctOptionIndex: 1
      },
      {
        question: "What happens if someone tries to tamper with a transaction on the blockchain?",
        options: [
          "The transaction is automatically corrected",
          "Nothing, blockchains can be easily modified",
          "The change is rejected as the hash values won't match",
          "The entire blockchain shuts down"
        ],
        correctOptionIndex: 2
      }
    ]
  }
};

// Mining basics lesson content
const miningBasics: LessonContent = {
  id: "mining-basics",
  title: "Mining Basics",
  content: [
    `# What is Cryptocurrency Mining?

Cryptocurrency mining is the process where specialized computers solve complex mathematical problems to verify transactions and add them to the blockchain. In return for this work, miners receive newly created cryptocurrency tokens as a reward. This process serves two crucial functions: it adds new transactions to the blockchain and brings new coins into circulation.`,

    `# The Mining Process

1. **Transaction Verification**: Miners collect pending transactions from the memory pool ("mempool").

2. **Building a Block**: Miners assemble these transactions into a block, starting with a special transaction that pays themselves the mining reward.

3. **Finding the Solution**: Miners then compete to solve a complex mathematical puzzle - finding a hash that meets specific criteria (Proof of Work).

4. **Block Validation**: When a miner finds a solution, other network nodes verify it, and if valid, the block is added to the blockchain.

5. **Receiving Rewards**: The winning miner receives the block reward (newly minted coins) plus any transaction fees.`,

    `# Mining Equipment

Mining equipment has evolved significantly since Bitcoin's inception:

**CPU Mining (2009)**: Using standard computer processors - now obsolete for most cryptocurrencies

**GPU Mining (2010-2013)**: Using graphics cards - more efficient for certain algorithms

**FPGA Mining (2011-2013)**: Using field-programmable gate arrays - customizable hardware

**ASIC Mining (2013-Present)**: Application-specific integrated circuits designed solely for mining - most efficient but expensive

**Mining Farms**: Large facilities with hundreds or thousands of mining machines, taking advantage of economies of scale and cheap electricity`
  ],
  quiz: {
    questions: [
      {
        question: "What is the primary purpose of cryptocurrency mining?",
        options: [
          "To hack into financial systems",
          "To verify transactions and add them to the blockchain",
          "To create digital art (NFTs)",
          "To encrypt user messages"
        ],
        correctOptionIndex: 1
      },
      {
        question: "What do miners receive in return for their work?",
        options: [
          "Government subsidies",
          "Company stocks",
          "Cryptocurrency tokens and transaction fees",
          "Cloud storage space"
        ],
        correctOptionIndex: 2
      },
      {
        question: "What is the name of the computational puzzle that miners solve?",
        options: [
          "Proof of Work",
          "Mining Conundrum",
          "Blockchain Riddle",
          "Hash Distribution Problem"
        ],
        correctOptionIndex: 0
      },
      {
        question: "Which mining equipment is generally the most efficient but most expensive?",
        options: [
          "CPU (Computer Processors)",
          "GPU (Graphics Cards)",
          "FPGA (Field-Programmable Gate Arrays)",
          "ASIC (Application-Specific Integrated Circuits)"
        ],
        correctOptionIndex: 3
      },
      {
        question: "What happens after a miner finds a solution to the puzzle?",
        options: [
          "The solution is kept secret",
          "Other miners immediately stop working",
          "Other network nodes verify it before adding the block to the blockchain",
          "The miner must solve additional puzzles"
        ],
        correctOptionIndex: 2
      }
    ]
  }
};

// Lessons repository
const lessonsRepository: { [key: string]: LessonContent } = {
  "what-is-blockchain": blockchainBasics,
  "mining-basics": miningBasics,
  // Add more lessons here as needed
};

function LessonDialog({ 
  open, 
  onClose, 
  lessonId,
  onComplete
}: { 
  open: boolean; 
  onClose: () => void; 
  lessonId: string;
  onComplete: (score: number) => void;
}) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"content" | "quiz">("content");
  const [contentPage, setContentPage] = useState(0);
  const [lessonData, setLessonData] = useState<LessonContent | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (open && lessonId) {
      setLessonData(lessonsRepository[lessonId]);
      setCurrentStep("content");
      setContentPage(0);
      setAnswers([]);
      setScore(0);
      setQuizSubmitted(false);
    }
  }, [open, lessonId]);

  if (!lessonData) return null;

  const totalContentPages = lessonData.content.length;
  const totalQuizQuestions = lessonData.quiz.questions.length;

  const nextContent = () => {
    if (contentPage < totalContentPages - 1) {
      setContentPage(prev => prev + 1);
    } else {
      setCurrentStep("quiz");
    }
  };

  const prevContent = () => {
    if (contentPage > 0) {
      setContentPage(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (quizSubmitted) return;
    
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const submitQuiz = () => {
    if (answers.length !== totalQuizQuestions) {
      toast({
        title: "Answer all questions",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === lessonData.quiz.questions[index].correctOptionIndex) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / totalQuizQuestions) * 100);
    setScore(finalScore);
    setQuizSubmitted(true);
    
    if (finalScore >= 70) {
      toast({
        title: "Quiz Completed!",
        description: `You scored ${finalScore}%. Congratulations!`,
      });
      onComplete(finalScore);
    } else {
      toast({
        title: "Quiz Completed",
        description: `You scored ${finalScore}%. Try again to improve your score.`,
        variant: "destructive"
      });
    }
  };

  const restartQuiz = () => {
    setAnswers([]);
    setQuizSubmitted(false);
  };

  const finishLesson = () => {
    onClose();
  };

  const renderContent = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{lessonData.title} - {contentPage + 1}/{totalContentPages}</DialogTitle>
        <DialogDescription>
          Read through this content to learn about blockchain fundamentals
        </DialogDescription>
      </DialogHeader>
      
      <div className="my-4 prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: lessonData.content[contentPage].replace(/^# (.*$)/gm, '<h2>$1</h2>').replace(/^([0-9]+\. )\*\*(.*)\*\*/gm, '<p><strong>$1$2</strong>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p>').replace(/\n-/g, '<br/>-') }} />
      </div>
      
      <div className="mt-4">
        <Progress value={(contentPage + 1) / totalContentPages * 100} className="h-2 mb-2" />
      </div>
      
      <DialogFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevContent}
          disabled={contentPage === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={nextContent}>
          {contentPage < totalContentPages - 1 ? (
            <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Start Quiz <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderQuiz = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{lessonData.title} - Knowledge Check</DialogTitle>
        <DialogDescription>
          Test your knowledge by answering these questions
        </DialogDescription>
      </DialogHeader>
      
      {!quizSubmitted ? (
        <div className="my-4 space-y-6">
          {lessonData.quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="space-y-4">
              <h3 className="font-medium text-lg">Question {qIndex + 1}</h3>
              <p>{question.question}</p>
              
              <RadioGroup value={answers[qIndex]?.toString()} className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={oIndex.toString()} 
                      id={`q${qIndex}-o${oIndex}`}
                      onClick={() => handleAnswerSelect(qIndex, oIndex)}
                    />
                    <Label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              
              {qIndex < lessonData.quiz.questions.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="my-6 flex flex-col items-center text-center">
          <div className={`rounded-full p-6 ${score >= 70 ? 'bg-green-500' : 'bg-orange-500'} bg-opacity-10 mb-4`}>
            {score >= 70 ? (
              <Trophy className={`h-12 w-12 text-green-500`} />
            ) : (
              <AlertCircle className={`h-12 w-12 text-orange-500`} />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Your Score: {score}%</h2>
          <p className="mb-6 text-muted-foreground">
            {score >= 70 
              ? `Great job! You've passed the quiz and earned ${Math.round(score * 5)} points!` 
              : "Keep learning and try again to pass the quiz."}
          </p>
          
          {score < 70 && (
            <div className="flex justify-center gap-4 w-full">
              <Button variant="outline" onClick={restartQuiz}>
                Try Again
              </Button>
              <Button onClick={() => {setCurrentStep("content"); setContentPage(0);}}>
                Review Content
              </Button>
            </div>
          )}
        </div>
      )}
      
      <DialogFooter>
        {!quizSubmitted ? (
          <Button onClick={submitQuiz} className="w-full sm:w-auto">
            Submit Answers
          </Button>
        ) : (
          <Button onClick={finishLesson} className="w-full sm:w-auto">
            {score >= 70 ? "Complete Lesson" : "Close"}
          </Button>
        )}
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        {currentStep === "content" ? renderContent() : renderQuiz()}
      </DialogContent>
    </Dialog>
  );
}

export default function LearnSection() {
  const [activeTab, setActiveTab] = useState("blockchain");
  const [lessonOpen, setLessonOpen] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState("");
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const { toast } = useToast();

  // Load saved progress from localStorage when component mounts
  useEffect(() => {
    const savedProgress = localStorage.getItem('learnProgress');
    if (savedProgress) {
      try {
        setUserProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Error loading learning progress:", e);
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(userProgress).length > 0) {
      localStorage.setItem('learnProgress', JSON.stringify(userProgress));
    }
  }, [userProgress]);

  const openLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setLessonOpen(true);
    
    // Mark as started if not already
    if (!userProgress[lessonId]) {
      setUserProgress(prev => ({
        ...prev,
        [lessonId]: {
          started: true,
          completed: false
        }
      }));
    }
  };

  const handleLessonComplete = (score: number) => {
    // Update user progress
    setUserProgress(prev => ({
      ...prev,
      [currentLessonId]: {
        ...prev[currentLessonId],
        completed: true,
        quizScore: score
      }
    }));
    
    // Update user points via API (in a real app)
    const points = Math.round(score * 5); // 5 points per percentage point
    
    // Show toast with earned points
    toast({
      title: "Points Earned!",
      description: `You've earned ${points} points for completing this lesson!`,
    });
  };

  const getProgressPercentage = (lessonId: string) => {
    if (!userProgress[lessonId]) return 0;
    if (userProgress[lessonId].completed) return 100;
    if (userProgress[lessonId].started) return 33; // Started but not completed
    return 0;
  };

  return (
    <div className="mb-10">
      <PageHeader 
        title="Learn Blockchain" 
        description="Explore interactive learning materials about blockchain technology and cryptocurrencies" 
      />
      
      <div className="mb-6">
        <Tabs 
          defaultValue="blockchain" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="blockchain">Blockchain Basics</TabsTrigger>
            <TabsTrigger value="mining">Mining</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blockchain">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LearnCard
                id="what-is-blockchain"
                title="What is Blockchain?"
                description="Learn about the fundamental technology behind cryptocurrencies."
                icon={<Layers className="h-5 w-5" />}
                level="beginner"
                onOpen={() => openLesson("what-is-blockchain")}
                progress={getProgressPercentage("what-is-blockchain")}
              />
              
              <LearnCard
                id="decentralization"
                title="Decentralization"
                description="Understand how blockchain enables trustless, peer-to-peer transactions."
                icon={<Server className="h-5 w-5" />}
                level="beginner"
                onOpen={() => openLesson("decentralization")}
                progress={getProgressPercentage("decentralization")}
              />
              
              <LearnCard
                id="consensus-mechanisms"
                title="Consensus Mechanisms"
                description="Explore how blockchain networks agree on the state of the ledger."
                icon={<Users className="h-5 w-5" />}
                level="intermediate"
                onOpen={() => openLesson("consensus-mechanisms")}
                progress={getProgressPercentage("consensus-mechanisms")}
              />
              
              <LearnCard
                id="smart-contracts"
                title="Smart Contracts"
                description="Learn about self-executing contracts with the terms directly written into code."
                icon={<BookOpen className="h-5 w-5" />}
                level="intermediate"
                onOpen={() => openLesson("smart-contracts")}
                progress={getProgressPercentage("smart-contracts")}
              />
              
              <LearnCard
                id="cryptography"
                title="Cryptography in Blockchain"
                description="Discover how cryptographic techniques secure blockchain transactions."
                icon={<Lock className="h-5 w-5" />}
                level="advanced"
                onOpen={() => openLesson("cryptography")}
                progress={getProgressPercentage("cryptography")}
              />
              
              <LearnCard
                id="scalability"
                title="Blockchain Scalability"
                description="Understand the challenges and solutions for blockchain scalability."
                icon={<BarChart3 className="h-5 w-5" />}
                level="advanced"
                onOpen={() => openLesson("scalability")}
                progress={getProgressPercentage("scalability")}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="mining">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LearnCard
                id="mining-basics"
                title="Mining Basics"
                description="Learn what cryptocurrency mining is and how it works."
                icon={<Cpu className="h-5 w-5" />}
                level="beginner"
                onOpen={() => openLesson("mining-basics")}
                progress={getProgressPercentage("mining-basics")}
              />
              
              <LearnCard
                id="proof-of-work"
                title="Proof of Work"
                description="Understand the original consensus mechanism used by Bitcoin."
                icon={<Server className="h-5 w-5" />}
                level="beginner"
                onOpen={() => openLesson("proof-of-work")}
                progress={getProgressPercentage("proof-of-work")}
              />
              
              <LearnCard
                id="mining-hardware"
                title="Mining Hardware"
                description="Explore the evolution of mining hardware from CPUs to ASICs."
                icon={<Cpu className="h-5 w-5" />}
                level="intermediate"
                onOpen={() => openLesson("mining-hardware")}
                progress={getProgressPercentage("mining-hardware")}
              />
              
              <LearnCard
                id="mining-pools"
                title="Mining Pools"
                description="Learn how miners collaborate to find blocks more consistently."
                icon={<Users className="h-5 w-5" />}
                level="intermediate"
                onOpen={() => openLesson("mining-pools")}
                progress={getProgressPercentage("mining-pools")}
              />
              
              <LearnCard
                id="mining-economics"
                title="Mining Economics"
                description="Understand the economics of mining including rewards and difficulty."
                icon={<Coins className="h-5 w-5" />}
                level="advanced"
                onOpen={() => openLesson("mining-economics")}
                progress={getProgressPercentage("mining-economics")}
              />
              
              <LearnCard
                id="environmental-impact"
                title="Environmental Impact"
                description="Explore the environmental considerations of blockchain mining."
                icon={<BarChart3 className="h-5 w-5" />}
                level="advanced"
                onOpen={() => openLesson("environmental-impact")}
                progress={getProgressPercentage("environmental-impact")}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="staking">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LearnCard
                id="staking-basics"
                title="Staking Basics"
                description="Learn what cryptocurrency staking is and how it differs from mining."
                icon={<Lock className="h-5 w-5" />}
                level="beginner"
                onOpen={() => openLesson("staking-basics")}
                progress={getProgressPercentage("staking-basics")}
              />
              
              <LearnCard
                id="proof-of-stake"
                title="Proof of Stake"
                description="Understand how Proof of Stake works as a consensus mechanism."
                icon={<Server className="h-5 w-5" />}
                level="beginner"
                onOpen={() => openLesson("proof-of-stake")}
                progress={getProgressPercentage("proof-of-stake")}
              />
              
              <LearnCard
                id="delegated-staking"
                title="Delegated Staking"
                description="Learn how delegation works in staking systems."
                icon={<Users className="h-5 w-5" />}
                level="intermediate"
                onOpen={() => openLesson("delegated-staking")}
                progress={getProgressPercentage("delegated-staking")}
              />
              
              <LearnCard
                id="staking-rewards"
                title="Staking Rewards"
                description="Understand how staking rewards are calculated and distributed."
                icon={<Coins className="h-5 w-5" />}
                level="intermediate"
                onOpen={() => openLesson("staking-rewards")}
                progress={getProgressPercentage("staking-rewards")}
              />
              
              <LearnCard
                id="liquid-staking"
                title="Liquid Staking"
                description="Explore how liquid staking derivatives work."
                icon={<BarChart3 className="h-5 w-5" />}
                level="advanced"
                onOpen={() => openLesson("liquid-staking")}
                progress={getProgressPercentage("liquid-staking")}
              />
              
              <LearnCard
                id="slashing-conditions"
                title="Slashing Conditions"
                description="Learn about penalties in Proof of Stake systems."
                icon={<Lock className="h-5 w-5" />}
                level="advanced"
                onOpen={() => openLesson("slashing-conditions")}
                progress={getProgressPercentage("slashing-conditions")}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="defi">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LearnCard
                id="defi-basics"
                title="DeFi Basics"
                description="Learn about decentralized finance and its components."
                icon={<Coins className="h-5 w-5" />}
                level="beginner"
                onOpen={() => openLesson("defi-basics")}
                progress={getProgressPercentage("defi-basics")}
              />
              
              <LearnCard
                id="decentralized-exchanges"
                title="Decentralized Exchanges"
                description="Understand how DEXes operate without intermediaries."
                icon={<BarChart3 className="h-5 w-5" />}
                level="beginner"
                onOpen={() => openLesson("decentralized-exchanges")}
                progress={getProgressPercentage("decentralized-exchanges")}
              />
              
              <LearnCard
                id="lending-borrowing"
                title="Lending & Borrowing"
                description="Learn about decentralized lending and borrowing platforms."
                icon={<Coins className="h-5 w-5" />}
                level="intermediate"
                onOpen={() => openLesson("lending-borrowing")}
                progress={getProgressPercentage("lending-borrowing")}
              />
              
              <LearnCard
                id="yield-farming"
                title="Yield Farming"
                description="Explore strategies for maximizing returns in DeFi."
                icon={<BarChart3 className="h-5 w-5" />}
                level="intermediate"
                onOpen={() => openLesson("yield-farming")}
                progress={getProgressPercentage("yield-farming")}
              />
              
              <LearnCard
                id="liquidity-provision"
                title="Liquidity Provision"
                description="Understand the role of liquidity providers in DeFi."
                icon={<Users className="h-5 w-5" />}
                level="advanced"
                onOpen={() => openLesson("liquidity-provision")}
                progress={getProgressPercentage("liquidity-provision")}
              />
              
              <LearnCard
                id="defi-risks"
                title="DeFi Risks"
                description="Learn about the risks associated with DeFi protocols."
                icon={<Lock className="h-5 w-5" />}
                level="advanced"
                onOpen={() => openLesson("defi-risks")}
                progress={getProgressPercentage("defi-risks")}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Learning Progress Overview */}
      <Card className="bg-secondary mb-10">
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
          <CardDescription>
            Track your journey through blockchain knowledge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-grow space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Blockchain Basics</span>
                  <span className="text-sm text-muted-foreground">
                    {Object.entries(userProgress).filter(([key, val]) => 
                      key.startsWith("what-is") || key.startsWith("decentral") || 
                      key.startsWith("consensus") || key.startsWith("smart") || 
                      key.startsWith("crypto") || key.startsWith("scalab")
                    ).filter(([_, val]) => val.completed).length} / 6 Completed
                  </span>
                </div>
                <Progress 
                  value={Object.entries(userProgress).filter(([key, val]) => 
                    key.startsWith("what-is") || key.startsWith("decentral") || 
                    key.startsWith("consensus") || key.startsWith("smart") || 
                    key.startsWith("crypto") || key.startsWith("scalab")
                  ).filter(([_, val]) => val.completed).length / 6 * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Mining</span>
                  <span className="text-sm text-muted-foreground">
                    {Object.entries(userProgress).filter(([key, val]) => 
                      key.startsWith("mining") || key.startsWith("proof-of-work") || 
                      key.startsWith("environmental")
                    ).filter(([_, val]) => val.completed).length} / 6 Completed
                  </span>
                </div>
                <Progress 
                  value={Object.entries(userProgress).filter(([key, val]) => 
                    key.startsWith("mining") || key.startsWith("proof-of-work") || 
                    key.startsWith("environmental")
                  ).filter(([_, val]) => val.completed).length / 6 * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Staking</span>
                  <span className="text-sm text-muted-foreground">
                    {Object.entries(userProgress).filter(([key, val]) => 
                      key.startsWith("staking") || key.startsWith("proof-of-stake") || 
                      key.startsWith("delegated") || key.startsWith("liquid") ||
                      key.startsWith("slashing")
                    ).filter(([_, val]) => val.completed).length} / 6 Completed
                  </span>
                </div>
                <Progress 
                  value={Object.entries(userProgress).filter(([key, val]) => 
                    key.startsWith("staking") || key.startsWith("proof-of-stake") || 
                    key.startsWith("delegated") || key.startsWith("liquid") ||
                    key.startsWith("slashing")
                  ).filter(([_, val]) => val.completed).length / 6 * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">DeFi</span>
                  <span className="text-sm text-muted-foreground">
                    {Object.entries(userProgress).filter(([key, val]) => 
                      key.startsWith("defi") || key.startsWith("decentralized-ex") || 
                      key.startsWith("lending") || key.startsWith("yield") ||
                      key.startsWith("liquidity")
                    ).filter(([_, val]) => val.completed).length} / 6 Completed
                  </span>
                </div>
                <Progress 
                  value={Object.entries(userProgress).filter(([key, val]) => 
                    key.startsWith("defi") || key.startsWith("decentralized-ex") || 
                    key.startsWith("lending") || key.startsWith("yield") ||
                    key.startsWith("liquidity")
                  ).filter(([_, val]) => val.completed).length / 6 * 100} 
                  className="h-2"
                />
              </div>
            </div>
            
            <div className="lg:w-64 bg-background rounded-lg p-4 flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center">
                  <Award className="h-10 w-10 text-green-500" />
                </div>
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {Object.values(userProgress).filter(val => val.completed).length}
                </div>
              </div>
              <h4 className="font-semibold">Blockchain Explorer</h4>
              <p className="text-xs text-muted-foreground mb-2 text-center">Complete all lessons to become a Blockchain Master</p>
              
              <div className="w-full bg-secondary mt-2 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2.5 rounded-full" 
                  style={{width: `${Object.values(userProgress).filter(val => val.completed).length / 24 * 100}%`}}
                ></div>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                {Object.values(userProgress).filter(val => val.completed).length} / 24 lessons completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Interactive Learning Feature */}
      <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-0 p-1 mt-10">
        <Card className="bg-background/90 border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/2">
                <h3 className="text-xl font-bold mb-2">Interactive Learning Path</h3>
                <p className="text-muted-foreground mb-4">
                  Our structured learning path helps you master blockchain concepts from beginner to advanced levels. 
                  Complete lessons, earn badges, and unlock rewards as you progress.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => openLesson("what-is-blockchain")}>Start Learning Journey</Button>
                  <Button variant="outline">View Curriculum</Button>
                </div>
              </div>
              
              <div className="md:w-1/2 bg-secondary p-4 rounded-lg">
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-green-500 font-bold">1</span>
                    </div>
                    <p className="text-xs">Beginner</p>
                  </div>
                  <div className="flex-grow mx-2 flex items-center">
                    <div className="h-1 bg-green-500 w-full"></div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-blue-500 font-bold">2</span>
                    </div>
                    <p className="text-xs">Intermediate</p>
                  </div>
                  <div className="flex-grow mx-2 flex items-center">
                    <div className="h-1 bg-blue-500 w-full"></div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-purple-500 font-bold">3</span>
                    </div>
                    <p className="text-xs">Advanced</p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm text-secondary-foreground ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Complete interactive lessons at your own pace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Earn badges and certificates for your achievements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Unlock additional mining and staking power</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Join community discussions with other learners</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </Card>
      
      {/* Lesson Dialog */}
      <LessonDialog 
        open={lessonOpen} 
        onClose={() => setLessonOpen(false)} 
        lessonId={currentLessonId}
        onComplete={handleLessonComplete}
      />
    </div>
  );
}
