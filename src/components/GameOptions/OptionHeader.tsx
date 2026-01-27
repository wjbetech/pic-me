interface Props {
  desc?: string;
}

export default function OptionHeader({ desc }: Props) {
  return <p className="mb-6 text-lg font-semibold opacity-80">{desc}</p>;
}
