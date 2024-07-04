// import React from "react";

export default function () {
  return (
    <main class="page-content">
      <header className="page-title">
        <h1>About</h1>
      </header>
      <article>
        <section className="about-container">
          <h3 className="text-center">Welcome to CopyeditorGPT Turbo 3000!</h3>
          <p className="about-paragraph">
            This is the only tool you'll need to proofread your manuscript, blog
            article, essay, or any other written work. Just upload a Word
            Document or paste your text directly into the uploader page and
            submit. Almost any length can be handled, even a novel of 100,000+
            words. After submitting, the power of artificial intelligence
            handles the rest, giving back a completely edited document for you
            to review in the workshop.
          </p>
        </section>
        <section className="about-container">
          <h3 className="text-center">How to Use</h3>
          <p className="about-paragraph">
            You will need your own OpenAI API key to use this tool. If you don't
            have an API key, head to{" "}
            <a
              href="https://platform.openai.com/account/api-keys/"
              target="_blank"
            >
              OpenAI's API page
            </a>{" "}
            and create an account. You will also need to set up a payment
            method, as the API does cost a negligible amount for usage.
          </p>
          <p className="about-paragraph">
            Save your API key in the settings menu, so that you won't need to
            enter it with each submission.
          </p>
        </section>
        <section className="about-container">
          <h3 className="text-center">Review Your Results</h3>
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
