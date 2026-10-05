// Each of 25 topic groups has three variants. A run draws one per group.
const bank = [];
function group(id, section, points, variants) {
  variants.forEach(([prompt, options, explanation, code = ""], i) =>
    bank.push({ id: id + "-" + (i + 1), group: id, section, points, prompt, options, answer: 0, explanation, code }));
}
group("deferred", "C# and .NET", 2, [
 ["What does this print?", ["2,3,4", "2,3", "1,2,3,4", "An InvalidOperationException"],
  "Where is deferred. Enumeration occurs inside string.Join, after 4 has been added. The collection is not modified during enumeration.",
  'var numbers = new List<int> { 1, 2, 3 };\nvar result = numbers.Where(n => n > 1);\nnumbers.Add(4);\nConsole.WriteLine(string.Join(",", result));'],
 ["What does this print?", ["2,3", "2,3,4", "1,2,3", "An empty line"],
  "ToList materializes the query before the source changes, so the result is a separate list containing 2 and 3.",
  'var numbers = new List<int> { 1, 2, 3 };\nvar result = numbers.Where(n => n > 1).ToList();\nnumbers.Add(4);\nConsole.WriteLine(string.Join(",", result));'],
 ["What does this print?", ["0,3", "0,0", "3,3", "6,3"],
  "Select does not execute at query creation. ToArray enumerates all three items and increments calls three times.",
  'int calls = 0;\nvar query = new[] { 1, 2, 3 }.Select(n => { calls++; return n * 2; });\nConsole.Write(calls + ",");\nvar values = query.ToArray();\nConsole.WriteLine(calls);']
]);
group("values", "C# and .NET", 2, [
 ["What are first.Count and original at the end?", ["6 and 5", "5 and 5", "6 and 6", "5 and 6"],
  "Both Counter variables refer to the same object. An int is copied by value, so changing copy does not change original.",
  'var first = new Counter { Count = 5 };\nvar second = first;\nsecond.Count++;\nint original = 5;\nint copy = original;\ncopy++;\n// Counter is a class with a public int Count property.'],
 ["What are a.X and b.X at the end?", ["2 and 9", "9 and 9", "2 and 2", "The code cannot compile"],
  "A struct is a value type. Assigning a to b copies the value, and changing b.X does not change a.X.",
  'Point a = new Point { X = 2 };\nPoint b = a;\nb.X = 9;\n// Point is a struct with a public int X field.'],
 ["What is printed?", ["red blue", "blue blue", "red red", "A NullReferenceException"],
  "Strings are immutable. ToUpper or replacement assignments do not mutate a shared string; here b is assigned a new reference.",
  'string a = "red";\nstring b = a;\nb = "blue";\nConsole.WriteLine(a + " " + b);']
]);
group("async", "C# and .NET", 2, [
 ["Which change best fixes this async method?", [
  "Await client.GetAsync, dispose the response, and await ReadAsStringAsync.",
  "Replace .Result with .GetAwaiter().GetResult() and keep everything else.",
  "Add Thread.Sleep before accessing .Result.",
  "Change the return type to async void."],
  ".Result blocks a thread. Await the asynchronous operation instead; changing to GetAwaiter().GetResult() still blocks. Dispose the response when finished.",
  'public async Task<string> GetStatusAsync()\n{\n    var response = client.GetAsync("/status").Result;\n    return await response.Content.ReadAsStringAsync();\n}'],
 ["An ASP.NET Core endpoint calls an asynchronous database API. Which is the best way to avoid blocking a request thread?", [
  "Return Task<T> and await the database operation.",
  "Use Task.Run and immediately call .Result.",
  "Use Thread.Sleep while checking IsCompleted.",
  "Mark the method async void."],
  "Await releases the thread while the I/O is incomplete. Task.Run plus .Result still blocks, and async void does not provide a task the caller can await."],
 ["Why should this non-event-handler method return Task instead of void?", [
  "So callers can await completion and observe failures through the returned task.",
  "Task automatically makes database operations transactional.",
  "Task guarantees the method runs on a dedicated thread.",
  "Void methods cannot contain await."],
  "Async void is mainly for event handlers. Task exposes completion and exceptions to callers; it does not imply a dedicated thread or transaction.",
  'public async void SaveAsync()\n{\n    await repository.SaveAsync();\n}']
]);
group("parallel", "C# and .NET", 2, [
 ["Which implementation starts both independent I/O operations concurrently and observes both completions?", [
  "var a = GetCustomerAsync(id); var b = GetAppointmentsAsync(id); await Task.WhenAll(a, b);",
  "var a = await GetCustomerAsync(id); var b = await GetAppointmentsAsync(id);",
  "GetCustomerAsync(id); GetAppointmentsAsync(id); return;",
  "await GetCustomerAsync(id); Task.Run(() => GetAppointmentsAsync(id));"],
  "Obtain both tasks before awaiting Task.WhenAll. Sequential awaits delay the second start; fire-and-forget does not observe completion."],
 ["These two methods share the same EF Core DbContext. Which approach is safe?", [
  "Await them sequentially, or redesign them to use separate contexts before running concurrently.",
  "Always run both through Task.WhenAll on the shared context.",
  "Put each call in Task.Run but share the context.",
  "Register the context as singleton so concurrency is supported."],
  "DbContext does not support multiple parallel operations on the same instance. Await each operation or give concurrent units of work separate contexts."],
 ["You must call a vendor API for 10,000 IDs, but the vendor allows only a small number of concurrent requests. What should you do?", [
  "Use bounded concurrency, honoring the vendor's limits and retry guidance.",
  "Start all 10,000 tasks immediately with Task.WhenAll.",
  "Use async void so requests finish faster.",
  "Remove timeouts to prevent throttling."],
  "Bounded concurrency limits in-flight work and resource pressure. Task.WhenAll alone does not impose a concurrency limit."]
]);
group("di", "C# and .NET", 1, [
 ["A singleton background worker needs a scoped DbContext. What is the best approach?", [
  "Create a scope per unit of work and resolve the context inside it.",
  "Inject the context directly into the singleton constructor.",
  "Store a context in a static field.",
  "Make the context singleton."],
  "A scoped service should not be captured by a singleton. A per-unit scope gives the context an appropriate lifetime and disposal boundary."],
 ["In a typical ASP.NET Core web request, what does AddScoped provide?", [
  "One instance per dependency-injection scope, usually the request.",
  "One instance per process, always.",
  "A new instance on every resolution, even within the same scope.",
  "One instance for each thread regardless of scope."],
  "Scoped instances are reused within their scope. Web requests normally have separate scopes; a scope is not a thread."],
 ["A service registered with AddTransient is resolved twice from the container. What is normally true?", [
  "Each resolution creates a new service instance.",
  "Both resolutions always return the same instance.",
  "It can be resolved only during an HTTP request.",
  "Its methods automatically run in parallel."],
  "Transient registration creates an instance for each resolution. Lifetime controls object reuse, not execution scheduling."]
]);
group("exceptions", "C# and .NET", 1, [
 ["Inside catch (Exception ex), which statement rethrows while preserving the original exception stack trace?", [
  "throw;", "throw ex;", "return ex;", "throw new Exception(ex.Message);"],
  "A bare throw rethrows the current exception without resetting its original stack trace."],
 ["A method catches an exception only to log it. It must still tell the caller the operation failed. What should follow logging?", [
  "throw;", "return true;", "Ignore the exception.", "Set the exception variable to null."],
  "Rethrow after logging when the caller must observe failure. Returning success hides a failed operation."],
 ["When adding domain context to an exception, which approach retains the original exception as its cause?", [
  'throw new InvalidOperationException("Import failed", ex);',
  'throw new Exception(ex.Message);',
  'throw new Exception("Import failed");',
  'Console.WriteLine(ex); return;'],
  "Passing ex as the inner exception preserves the original failure information while adding meaningful context."]
]);
group("cancellation", "C# and .NET", 2, [
 ["Which replacement propagates cancellation through both operations? Assume modern .NET overloads.", [
  'await Task.Delay(1000, token); return await client.GetStringAsync("/data", token);',
  'await Task.Delay(1000); return await client.GetStringAsync("/data");',
  'token = CancellationToken.None; return await client.GetStringAsync("/data", token);',
  'await Task.Delay(1000, token); return client.GetStringAsync("/data").Result;'],
  "Pass the caller's token to every cancellable operation. Merely accepting a token as a parameter does not cancel the work."],
 ["How should a long CPU-bound loop cooperate with cancellation?", [
  "Periodically call token.ThrowIfCancellationRequested().",
  "Assume accepting a token automatically stops the loop.",
  "Catch and ignore every OperationCanceledException.",
  "Set a local boolean after the loop completes."],
  "Cancellation is cooperative. CPU-bound code must check the token, while cancellable I/O APIs must receive it."],
 ["An operation must stop when either the caller cancels or a five-second budget expires. Which approach fits?", [
  "Create a linked CancellationTokenSource from the caller token, call CancelAfter, and pass its token to the work.",
  "Use CancellationToken.None for the work and cancel the caller's source.",
  "Sleep for five seconds before starting the operation.",
  "Create a timeout source but never pass its token to the operation."],
  "A linked source observes caller cancellation and its own timeout. Dispose it after use and pass the linked token to the underlying operations."]
]);
group("threads", "C# and .NET", 2, [
 ["Multiple threads increment an int field. Which is a thread-safe replacement for processedCount++?", [
  "Interlocked.Increment(ref processedCount);",
  "processedCount = processedCount + 1;",
  "Mark processedCount volatile and keep ++.",
  "await Task.Delay(1); processedCount++;"],
  "Increment is a read-modify-write operation. Interlocked makes it atomic; volatile alone does not make ++ atomic."],
 ["Several threads perform a check-then-add sequence on a shared Dictionary. What protects the compound operation?", [
  "Use a shared lock around both the check and the add, with all access following the same synchronization policy.",
  "Lock only the check and leave Add outside.",
  "Make the Dictionary reference readonly.",
  "Add a one-millisecond delay before Add."],
  "The entire check-and-add must be atomic relative to other access. Readonly protects reassignment of the reference, not mutations of its contents."],
 ["A ConcurrentDictionary.GetOrAdd value factory sends a payment. Why is this unsafe?", [
  "The factory may run more than once under contention, even though only one value is stored.",
  "ConcurrentDictionary cannot store reference types.",
  "GetOrAdd always serializes external side effects.",
  "The factory can only execute on the main thread."],
  "Value factories can execute multiple times during contention. Keep them free of non-idempotent side effects, or use an appropriate durable coordination strategy."]
]);
group("http", "C# and .NET", 1, [
 ["An ASP.NET Core service regularly calls several vendor APIs. Which is a good client-management choice?", [
  "Named or typed clients through IHttpClientFactory.",
  "Create and dispose a new HttpClient for every record.",
  "Disable connection pooling for every request.",
  "Use one new socket per JSON field."],
  "IHttpClientFactory manages handler pooling and supports per-client configuration. Repeatedly creating clients can cause connection-management problems."],
 ["Why should a vendor call have an explicit, reasonable timeout?", [
  "To bound how long the caller waits and avoid tying up resources indefinitely.",
  "To guarantee the vendor never processes a timed-out request.",
  "To make every failure safe to retry.",
  "To replace all cancellation handling."],
  "A timeout bounds waiting, but does not prove the server did nothing. Idempotency still matters when retrying writes."],
 ["Where should an API key for a server-side vendor integration be stored?", [
  "In a suitable secret store or protected configuration, with restricted access and rotation.",
  "In a public GitHub repository.",
  "In a browser JavaScript bundle.",
  "In every request log to simplify debugging."],
  "Secrets belong in protected server-side storage. Avoid exposing them through source control, client bundles, or logs."]
]);
group("coding", "C# and .NET", 3, [
 ["Which implementation returns the first repeated ID, ignoring case, in expected O(n) time? Input and elements are non-null.", [
  "var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase); foreach (var id in ids) if (!seen.Add(id)) return id; return null;",
  "return ids.OrderBy(x => x).FirstOrDefault();",
  "var seen = new HashSet<string>(); foreach (var id in ids) if (!seen.Add(id)) return id; return null;",
  "return ids.Distinct().LastOrDefault();"],
  "A case-insensitive HashSet tracks prior IDs. The first failed Add identifies the first repeated occurrence, in expected O(n) total time."],
 ["Which function correctly returns true when a non-null string contains balanced parentheses, ignoring other characters?", [
  "int depth = 0; foreach (char c in s) { if (c == '(') depth++; else if (c == ')' && --depth < 0) return false; } return depth == 0;",
  "return s.Count(c => c == '(') == s.Count(c => c == ')');",
  "return s.StartsWith(\"(\") && s.EndsWith(\")\");",
  "return s.Length % 2 == 0;"],
  "Track depth and reject any closing parenthesis that makes it negative. Equal counts alone incorrectly accept ')('."],
 ["Which approach computes occurrence counts for non-null, case-insensitive event IDs in expected O(n) time?", [
  "Use Dictionary<string,int>(StringComparer.OrdinalIgnoreCase); for each ID, TryGetValue and store count + 1.",
  "For every ID, scan the entire input and count matching values.",
  "Put all IDs in a HashSet and return its Count for every ID.",
  "Sort IDs by length and count adjacent equal-length entries."],
  "A dictionary accumulates each ID's count with expected constant-time operations. A nested full scan is O(n squared), and a set loses multiplicity."]
]);
group("idempotency", "Integration logic", 2, [
 ["The same appointment-created event may arrive twice at once. Which design best prevents duplicate local appointments?", [
  "Use a durable vendor/event key with a unique constraint, and atomically record processing with the appointment change.",
  "Check an in-memory list before every insert.",
  "Assume duplicate events never arrive concurrently.",
  "Acknowledge first, then create the appointment without a record."],
  "Durable uniqueness plus an atomic transaction protects concurrent duplicate handling. A check alone has a race; memory is lost on restart."],
 ["A consumer commits a database change and crashes before acknowledging the message. What should the design expect?", [
  "Redelivery, handled safely through idempotent processing.",
  "The broker must know the database transaction committed.",
  "The message can never reappear.",
  "The database automatically sends the missing acknowledgment."],
  "A broker acknowledgment and a database commit are separate actions. A crash between them can cause redelivery."],
 ["You must update your database and reliably publish an integration event. Which pattern avoids a lost event between the two steps?", [
  "Write the change and an outbox record in one transaction; publish the outbox asynchronously with duplicate-safe consumers.",
  "Commit the database, then publish once without retry.",
  "Publish first and assume the database update cannot fail.",
  "Hold the event only in a process-local variable."],
  "The transactional outbox makes the change and publish intent atomic. Dispatch can still duplicate messages, so consumers need idempotency."]
]);
group("retry", "Integration logic", 2, [
 ["Which retry policy is most appropriate?", [
  "Do not blindly retry validation 400s; back off for 429/503; treat timed-out writes as possibly completed.",
  "Retry every response immediately forever.",
  "Retry 400s but never 503s.",
  "Assume every timed-out create request had no effect."],
  "Validation errors need correction. Transient failures may be retried within bounds. Timeouts leave write outcomes ambiguous, requiring idempotency or reconciliation."],
 ["An HTTP 429 includes Retry-After: 30. What is the best next step?", [
  "Honor the vendor's retry delay, within the operation's time budget, and limit subsequent requests.",
  "Retry every millisecond until it succeeds.",
  "Change the request to POST to bypass the limit.",
  "Treat it as proof that the payload is invalid."],
  "429 signals rate limiting. Respect retry guidance and reduce load instead of amplifying it."],
 ["A create-payment call times out after transmission. The vendor supports idempotency keys. What should a retry use?", [
  "The same key for the same logical payment, following the vendor's idempotency contract.",
  "A brand-new key for every network attempt.",
  "No key because timeouts imply no payment happened.",
  "The same key for all unrelated customers and payments."],
  "Reusing the logical operation's key allows the vendor to deduplicate retries. Different operations need different keys."]
]);
group("ordering", "Integration logic", 2, [
 ["Customer version 42 arrives before version 41. How should updates be applied if versions increase monotonically per customer?", [
  "Atomically apply an event only if its version is greater than the stored version.",
  "Always let the last-arriving message win.",
  "Sort only by email address.",
  "Apply both updates without comparing versions."],
  "Arrival order need not equal source order. A conditional version update prevents stale writes and concurrent races."],
 ["You need per-customer event order while allowing different customers to process in parallel. What partitioning approach helps?", [
  "Use a stable customer ID as the partition key and preserve ordering within each partition.",
  "Choose a new random partition key for every event.",
  "Partition only by the current second.",
  "Remove customer IDs from all messages."],
  "A stable aggregate key keeps related events together. Ordering and consumer behavior must still follow the broker's guarantees."],
 ["An event consumer sees versions 10 and then 12, and each event is a delta that depends on its predecessor. What should it do?", [
  "Detect the gap and recover version 11 or reconcile from authoritative state before applying dependent deltas.",
  "Assume version 11 made no meaningful changes.",
  "Apply version 12 twice.",
  "Permanently delete version 12 without recording the issue."],
  "A missing predecessor can make delta application incorrect. Gap recovery or state reconciliation is required."]
]);
group("resilience", "Integration logic", 2, [
 ["What does an open circuit breaker normally do?", [
  "Reject calls quickly or use an explicit fallback until limited recovery probes are allowed.",
  "Retry continuously without delay.",
  "Guarantee no requests ever fail.",
  "Roll back every transaction at the vendor."],
  "A breaker stops repeated calls to an unhealthy dependency. A retry policy repeats attempts; it is a different mechanism."],
 ["One malformed message fails identically after several bounded attempts. What is the best response?", [
  "Quarantine it in a dead-letter workflow with diagnostics and a controlled replay path.",
  "Retry forever and block every later message.",
  "Silently discard it and report success.",
  "Disable payload validation for all future messages."],
  "A poison message needs visible isolation, investigation, and controlled recovery. Endless retries waste resources and can block progress."],
 ["Which practice best supports reliable event replay after a mapping bug is fixed?", [
  "Retain suitable source events, track versions, and make side effects idempotent with an audited replay process.",
  "Replay all events against production with no duplicate checks.",
  "Delete all failed events immediately.",
  "Remove correlation IDs to save space."],
  "Replaying can repeat side effects. Retained events, version-aware handling, idempotency, and an auditable process make recovery safer."]
]);
group("logic", "Integration logic", 2, [
 ["A must precede C; B must be immediately before D; C cannot be last. Which order works?", [
  "A, C, B, D", "A, B, D, C", "B, D, A, C", "C, A, B, D"],
  "A-C-B-D satisfies all three rules: A precedes C, B immediately precedes D, and C is second."],
 ["P must precede R; Q must be immediately before S; R cannot be last. Which order works?", [
  "P, R, Q, S", "Q, S, P, R", "P, Q, S, R", "R, P, Q, S"],
  "P-R-Q-S satisfies all constraints. The second and third options put R last, and the fourth puts R before P."],
 ["A rollout requires tests before staging, staging before production, and approval after staging but before production. Which sequence is valid?", [
  "Tests, staging, approval, production",
  "Approval, tests, staging, production",
  "Tests, approval, production, staging",
  "Staging, tests, approval, production"],
  "The dependencies create a single order: tests, then staging, then approval, then production."]
]);
group("capacity", "Numerical reasoning", 1, [
 ["Five workers each process 40 events/second at full capacity. They average 75% utilization. How many events can they process in one hour?", [
  "540,000", "720,000", "150,000", "180,000"],
  "40 × 5 × 0.75 × 3,600 = 540,000 events."],
 ["Four workers each process 25 events/second at full capacity. They average 80% utilization. How many events can they process in 30 minutes?", [
  "144,000", "180,000", "72,000", "288,000"],
  "25 × 4 × 0.80 × 1,800 = 144,000 events."],
 ["Six workers each process 50 events/second at full capacity. They average 60% utilization. How many events can they process in 20 minutes?", [
  "216,000", "360,000", "180,000", "432,000"],
  "50 × 6 × 0.60 × 1,200 = 216,000 events."]
]);
group("failures", "Numerical reasoning", 1, [
 ["250,000 daily requests have a failure rate reduced from 0.8% to 0.2%. How many fewer fail each day?", [
  "1,500", "500", "2,000", "15,000"],
  "250,000 × (0.008 − 0.002) = 1,500 fewer failures."],
 ["120,000 daily requests have a failure rate reduced from 1.5% to 0.5%. How many fewer fail each day?", [
  "1,200", "600", "1,800", "120"],
  "120,000 × (0.015 − 0.005) = 1,200 fewer failures."],
 ["400,000 daily requests have a failure rate reduced from 0.5% to 0.125%. How many fewer fail each day?", [
  "1,500", "500", "2,000", "3,750"],
  "400,000 × (0.005 − 0.00125) = 1,500 fewer failures."]
]);
group("percentage", "Numerical reasoning", 1, [
 ["Average processing time falls from 800 ms to 500 ms. What is the percentage reduction?", [
  "37.5%", "60%", "62.5%", "30%"],
  "(800 − 500) / 800 × 100 = 37.5%. Use the original value as the denominator."],
 ["Average processing time falls from 600 ms to 450 ms. What is the percentage reduction?", [
  "25%", "33.3%", "75%", "15%"],
  "(600 − 450) / 600 × 100 = 25%."],
 ["Throughput rises from 160 to 200 requests/second. What is the percentage increase?", [
  "25%", "20%", "40%", "125%"],
  "(200 − 160) / 160 × 100 = 25%. The new rate is 125% of the original; the increase is 25%."]
]);
group("average", "Numerical reasoning", 1, [
 ["80% of requests take 100 ms, 15% take 300 ms, and 5% take 1,000 ms. What is the mean duration?", [
  "175 ms", "466.7 ms", "100 ms", "300 ms"],
  "0.80 × 100 + 0.15 × 300 + 0.05 × 1,000 = 175 ms."],
 ["70% of requests take 80 ms, 20% take 200 ms, and 10% take 600 ms. What is the mean duration?", [
  "156 ms", "293.3 ms", "120 ms", "200 ms"],
  "0.70 × 80 + 0.20 × 200 + 0.10 × 600 = 156 ms."],
 ["90% of requests take 50 ms, 8% take 250 ms, and 2% take 1,000 ms. What is the mean duration?", [
  "85 ms", "433.3 ms", "50 ms", "130 ms"],
  "0.90 × 50 + 0.08 × 250 + 0.02 × 1,000 = 85 ms."]
]);
group("backlog", "Numerical reasoning", 2, [
 ["A queue has 18,000 events. Arrivals are 120/second and processing is 180/second. With constant rates and no failures, when is the backlog cleared?", [
  "5 minutes", "100 seconds", "150 seconds", "10 minutes"],
  "Net drain = 180 − 120 = 60/second. 18,000 / 60 = 300 seconds = 5 minutes."],
 ["A queue has 24,000 events. Arrivals are 150/second and processing is 250/second. With constant rates and no failures, when is the backlog cleared?", [
  "4 minutes", "96 seconds", "160 seconds", "8 minutes"],
  "Net drain = 250 − 150 = 100/second. 24,000 / 100 = 240 seconds = 4 minutes."],
 ["A queue has 12,000 events. Arrivals are 90/second and processing is 80/second. What happens if these rates remain constant?", [
  "It never clears and grows by 600 events per minute.",
  "It clears in 150 seconds.",
  "It clears in 20 minutes.",
  "It stays at exactly 12,000 events."],
  "Arrivals exceed processing by 10/second, so the backlog grows by 10 × 60 = 600 per minute."]
]);
group("verbal-rule", "Verbal reasoning", 1, [
 ["Use only this passage: Integrations requiring certification cannot be released before certification arrives. Scheduling passed functional tests but its required certification is pending. Statement: Scheduling can now be released.", [
  "False", "True", "Cannot determine"],
  "The certification requirement still blocks release. Passing functional tests does not satisfy it."],
 ["Use only this passage: A release needs both security approval and QA sign-off. Security approved release R; QA has not signed off. Statement: R meets the stated release prerequisites.", [
  "False", "True", "Cannot determine"],
  "Both prerequisites are required. Security approval alone is insufficient."],
 ["Use only this passage: Every production export must be encrypted. A test export is unencrypted and has not been sent to production. Statement: This test export violates the stated production encryption rule.", [
  "False", "True", "Cannot determine"],
  "The stated rule applies to production exports. The passage explicitly says this export has not been sent to production."]
]);
group("verbal-scope", "Verbal reasoning", 1, [
 ["Use only this passage: A company integrates with three platforms. Some integrations require vendor certification. Statement: All three platforms require certification.", [
  "Cannot determine", "True", "False"],
  "Some establishes that at least one requires certification, but the passage does not say whether all three do."],
 ["Use only this passage: Several engineers completed cloud training. Every trained engineer received a certificate. Statement: Every engineer on the team received a certificate.", [
  "Cannot determine", "True", "False"],
  "The passage only establishes certificates for trained engineers. It does not establish that all engineers were trained or certified."],
 ["Use only this passage: Every critical incident receives a postmortem. Incident K received a postmortem. Statement: Incident K was critical.", [
  "Cannot determine", "True", "False"],
  "The rule does not say that only critical incidents receive postmortems. Inferring criticality from a postmortem reverses the implication."]
]);
group("verbal-inference", "Verbal reasoning", 1, [
 ["Use only this passage: Every production integration must have an assigned owner. Statement: A production integration without an owner violates the requirement.", [
  "True", "False", "Cannot determine"],
  "The statement follows directly from the universal ownership requirement."],
 ["Use only this passage: All emergency changes require retrospective review. Change M is an emergency change. Statement: M requires retrospective review.", [
  "True", "False", "Cannot determine"],
  "M belongs to the category covered by the rule, so the requirement applies."],
 ["Use only this passage: No customer data may be stored in public logs. A log containing customer data is publicly accessible. Statement: This log violates the rule.", [
  "True", "False", "Cannot determine"],
  "The log contains exactly the type of data and has the public exposure prohibited by the rule."]
]);
group("causation", "Verbal reasoning", 1, [
 ["A manager says AI code review caused the entire 20% defect reduction observed after its introduction. What is the strongest objection?", [
  "Other changes during the same period could have contributed.",
  "AI can never detect defects.",
  "Defects cannot be measured.",
  "A 20% change is always meaningless."],
  "Before-and-after correlation does not isolate causation. Changes in tests, release scope, staffing, or measurement could contribute."],
 ["Team A has fewer incidents than Team B. A manager concludes A's engineers are more skilled. What is the strongest missing consideration?", [
  "The teams may differ in traffic, system complexity, release volume, and incident definitions.",
  "Incident counts prove individual skill exactly.",
  "Teams with incidents never use tests.",
  "Every service has identical operational risk."],
  "Raw counts lack comparable exposure and context. They do not alone establish a difference in engineering skill."],
 ["A new deployment tool shipped at the same time release sizes were halved. Failure rates then fell. What can you conclude from this evidence alone?", [
  "The decline coincided with both changes; their individual effects have not been isolated.",
  "The tool caused the entire decline.",
  "Smaller releases caused the entire decline.",
  "Neither change could have contributed."],
  "Multiple simultaneous changes prevent attribution to a single cause from this observation alone."]
]);
group("communication", "Verbal reasoning", 2, [
 ["Choose the best stakeholder update. Facts: a vendor change delays appointment sync; existing appointments are available; a fix is being tested; no restoration time is confirmed; next update is 3 p.m.", [
  "A vendor API change is delaying appointment sync; existing appointments remain available. We identified the cause and are testing a fix, with no confirmed restoration time. Next update: 3 p.m.",
  "Everything is broken, but it will certainly be fixed by 3 p.m.",
  "The vendor caused this. There is nothing we can do.",
  "There is a technical issue. No further information is available."],
  "The best update states impact, current action, uncertainty, and the next communication time without blame or an unsupported promise."],
 ["Choose the best update. Facts: imports are delayed, no confirmed data loss, recovery is running, completion time is unknown, next update in 30 minutes.", [
  "Imports are delayed and recovery is running. We have no confirmed data loss and are still determining completion time. We will update you in 30 minutes.",
  "No data could possibly be lost and recovery is guaranteed in 30 minutes.",
  "The system failed because another team did poor work.",
  "All imports are permanently lost."],
  "Distinguish no confirmed loss from a guarantee of no loss. State what is known and when the next update will arrive."],
 ["Choose the best release update. Facts: a security review found an issue, the release is held, the existing service is unaffected, a revised schedule is not confirmed.", [
  "We are holding the release to address an issue found in security review. The existing service is unaffected; we will confirm a revised schedule after assessing the fix.",
  "Production is down and we will restore it tonight.",
  "The review is unnecessary, so we will release immediately.",
  "The release is ready with no outstanding concerns."],
  "The update accurately separates a held release from a production outage and avoids an unconfirmed delivery promise."]
]);
export const QUESTIONS = Object.freeze(bank);
export const SECTIONS = [
  { name: "C# and .NET", minutes: 20, points: 18, count: 10 },
  { name: "Integration logic", minutes: 10, points: 10, count: 5 },
  { name: "Numerical reasoning", minutes: 8, points: 6, count: 5 },
  { name: "Verbal reasoning", minutes: 7, points: 6, count: 5 }
];
