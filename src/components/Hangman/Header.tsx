export default function Header({
  lives,
  score,
  round,
}: {
  lives: number;
  score: number;
  round: number;
}) {
  return (
    <div className="text-center mt-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">Hangman</h2>
      <div className="flex justify-center gap-6 text-lg">
        <p className="font-semibold">
          Lives: <span className="text-error">{lives}</span>
        </p>
        <p className="font-semibold">
          Score: <span className="text-success">{score}</span>
        </p>
        <p className="font-semibold opacity-70">Round: {round}</p>
      </div>
    </div>
  );
}
