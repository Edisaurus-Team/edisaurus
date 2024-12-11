
export default function () {
  return (
    <main className="page-content">
      <header className="page-title">
        <h2 className="page-name">About</h2>
      </header>
      <article>
        <section className="about-container">
          <h4 className="text-center">Welcome to Copy-Paste Editor!</h4>
          <p className="about-paragraph">
            This is the only tool you'll need to proofread your manuscript, blog
            article, essay, or any other written work. Just paste your text directly into the uploader page and
            submit. Almost any length can be handled, even a novel of 100,000+
            words. After submitting, the power of artificial intelligence
            handles the rest, giving back a completely edited document for you
            to review in the workshop.
          </p>
        </section>
        <section className="about-container">
          <h4 className="text-center">How to Use</h4>
          <p className="about-paragraph">
            To get started, simply head over to the <a href="/uploader">uploader</a> page and paste some text which needs editing. 
            Your text will be edited by a ChatGPT engine, then returned for a comparison.
          </p>
        </section>
        <section className="about-container">
          <h4 className="text-center">Review Your Results</h4>
          <p className="about-paragraph">
            Every change made to the text is marked by a set of <del>red </del>
            and <ins>green </ins> highlights. You may click on the{" "}
            <del>red</del> marks to reject a set of changes, or click on{" "}
            <ins>green</ins> to accept them.
          </p>
        </section>
      </article>
    </main>
  );
}
