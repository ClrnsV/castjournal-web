export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-foreground">
      <h1 className="mb-2 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: September 2026</p>

      <p className="mb-6">
        CastJournal ("we", "our", "the app") is a capstone project for logging and
        sharing fishing catches. This page explains what information we collect and
        how it is used.
      </p>

      <h2 className="mb-2 mt-8 text-xl font-semibold">Information we collect</h2>
      <ul className="mb-6 list-disc space-y-2 pl-6">
        <li>
          <strong>Account information:</strong> your name, email address, and username,
          either entered directly or provided by Google when you sign in with your
          Google account.
        </li>
        <li>
          <strong>Content you add:</strong> catch records (species, weight, length,
          location, photos, notes), comments, and follow relationships you create in
          the app.
        </li>
        <li>
          <strong>Usage data:</strong> basic activity needed to run features like
          notifications and search.
        </li>
      </ul>

      <h2 className="mb-2 mt-8 text-xl font-semibold">Google sign-in</h2>
      <p className="mb-6">
        When you sign in with Google, we only request your basic profile information
        (name, email address, profile picture) to create and log you into your
        CastJournal account. We do not access your Gmail, Google Drive, or any other
        Google service.
      </p>

      <h2 className="mb-2 mt-8 text-xl font-semibold">How we use your information</h2>
      <p className="mb-6">
        Your information is used to operate core features of the app: authentication,
        displaying your catches and profile, the community feed, search, and
        analytics. We do not sell your data or share it with third parties for
        advertising.
      </p>

      <h2 className="mb-2 mt-8 text-xl font-semibold">Data storage</h2>
      <p className="mb-6">
        Data is stored in our application database and is retained for as long as
        your account is active. You may request deletion of your account and
        associated data by contacting us at the email below.
      </p>

      <h2 className="mb-2 mt-8 text-xl font-semibold">Academic project notice</h2>
      <p className="mb-6">
        CastJournal is developed as a capstone/thesis project. It is not a commercial
        product, but the same care is taken with your data as described in this
        policy.
      </p>

      <h2 className="mb-2 mt-8 text-xl font-semibold">Contact</h2>
      <p>
        Questions about this policy can be sent to{' '}
        <a href="mailto:clarencebaquiller@gmail.com" className="underline underline-offset-4">
          clarencebaquiller@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
