import { motion } from "framer-motion";
// Use a loose MotionDiv alias to avoid strict Motion prop type issues
// when passing standard HTML props like `className` in TSX.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MotionDiv: any = motion.div;

export default MotionDiv;
