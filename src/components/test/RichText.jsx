import { Fragment } from "react";
import { InlineMath, BlockMath } from "react-katex";

export default function RichText({ children, highlight = "" }) {
  const parts = String(children ?? "").split(
    /(\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\)|\$(?!\s)[^$\n]+?\$)/g,
  );
  return parts.map((part, index) => {
    if (part.startsWith("$$") && part.endsWith("$$"))
      return <BlockMath key={index} math={part.slice(2, -2)} />;
    if (part.startsWith("\\(") && part.endsWith("\\)"))
      return <InlineMath key={index} math={part.slice(2, -2)} />;
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2)
      return <InlineMath key={index} math={part.slice(1, -1)} />;
    if (!highlight || !part.includes(highlight))
      return <Fragment key={index}>{part}</Fragment>;
    return (
      <Fragment key={index}>
        {part.split(highlight).map((text, i) => (
          <Fragment key={i}>
            {i > 0 && <mark>{highlight}</mark>}
            {text}
          </Fragment>
        ))}
      </Fragment>
    );
  });
}
