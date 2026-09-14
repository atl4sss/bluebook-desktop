import RichText from "./RichText";

export function StudentResponseDirections() {
  return (
    <div className="student-response-directions">
      <h2>Student-produced response directions</h2>
      <ul>
        <li>
          If you find more than one correct answer, enter only one answer.
        </li>
        <li>
          You can enter up to 5 characters for a positive answer and up to 6
          characters (including the negative sign) for a negative answer.
        </li>
        <li>
          If your answer is a <strong>fraction</strong> that doesn’t fit in the
          provided space, enter the decimal equivalent.
        </li>
        <li>
          If your answer is a <strong>decimal</strong> that doesn’t fit in the
          provided space, enter it by truncating or rounding at the fourth
          digit.
        </li>
        <li>
          If your answer is a <strong>mixed number</strong> (such as 3½), enter
          it as an improper fraction (7/2) or its decimal equivalent (3.5).
        </li>
        <li>
          Don’t enter symbols such as a percent sign, comma, or dollar sign.
        </li>
      </ul>
      <table>
        <caption>Examples</caption>
        <thead>
          <tr>
            <th>Answer</th>
            <th>Acceptable ways to enter answer</th>
            <th>Unacceptable: will NOT receive credit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>3.5</td>
            <td>
              <code>3.5</code>
              <code>3.50</code>
              <code>7/2</code>
            </td>
            <td>
              <code>31/2</code>
              <code>3 1/2</code>
            </td>
          </tr>
          <tr>
            <td>
              <RichText>{"$\\frac{2}{3}$"}</RichText>
            </td>
            <td>
              <code>2/3</code>
              <code>.6666</code>
              <code>.6667</code>
              <code>0.666</code>
              <code>0.667</code>
            </td>
            <td>
              <code>0.66</code>
              <code>.66</code>
              <code>0.67</code>
              <code>.67</code>
            </td>
          </tr>
          <tr>
            <td>
              <RichText>{"$-\\frac{1}{3}$"}</RichText>
            </td>
            <td>
              <code>-1/3</code>
              <code>-.3333</code>
              <code>-0.333</code>
            </td>
            <td>
              <code>-.33</code>
              <code>-0.33</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function StudentResponseInput({ value, onChange }) {
  const fraction = /^(-?\d+)\/(\d+)$/.exec(value.trim());
  return (
    <div className="student-response">
      <label htmlFor="grid-answer" className="sr-only">
        Your answer
      </label>
      <input
        id="grid-answer"
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby="answer-preview-label"
      />
      <h2 id="answer-preview-label">Answer Preview:</h2>
      <div className="answer-preview" aria-live="polite">
        {fraction ? (
          <RichText>{`$\\frac{${fraction[1]}}{${fraction[2]}}$`}</RichText>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
