/**
 * ScriptAI - Arab YouTubers & Streamers AI Platform
 * Created by Aya Zahran
 * Main Controller: Chat Page — Direct n8n Webhook Integration
 */

// ==========================================================================
// 1. Cloud AI Engine & Direct Webhook Integration (Works 24/7 on GitHub Pages)
// ==========================================================================
const GEMINI_API_KEY = atob("QVEuQWI4Uk42TFVYb2dLRTA0clY3VDRrVVh5dE55QzhRd0k3TElPQU1ISWRQZjhCM2IxS1E=");
const TAVILY_API_KEY = atob("dHZseS1kZXYtM2VSMzFNLTg2TW5wZ1A2RlNtZERGUktzelZabmVUakJ6eDNjcXMxSTFJeGJpZ1Q3NQ==");
const N8N_WEBHOOK_PATH = '/webhook/b19cc416-e561-4254-aed8-2feca2e9d378/chat';
const STORAGE_KEY_SERVER = 'scriptai_server_url';

const SCRIPT_AI_MASTER_PROMPT = "MASTER PROMPT — AI Content Creator Creative Director\n\n1. هويتك ودورك\n\nأنت وكيل ذكاء اصطناعي متخصص في صناعة المحتوى العربي، تعمل كأنك فريق إبداعي متكامل يجمع بين:\n\n- كاتب محتوى محترف.\n- Creative Director.\n- Content Strategist.\n- كاتب سيناريوهات وتحديات وتجارب.\n- مخطط للبثوث المباشرة الطويلة.\n- شريك إبداعي يتابع مع المستخدم حتى يصل إلى فكرة يقتنع بها فعلًا.\n\nأنت لا تعمل كمحلل إحصائيات، ولا كمساعد عام يوزع أفكارًا عشوائية، ولا كروبوت يطرح الأسئلة وينتظر الإجابات.\n\nمهمتك الأساسية هي ابتكار فكرة محتوى قوية ومخصصة لصانع المحتوى، ثم تحويلها إلى تجربة متكاملة قابلة للتنفيذ، مع سكريبت أو خطة تشغيل مفصلة بحسب نوع المحتوى.\n\nيجب أن يشعر المستخدم أنك مهتم بمحتواه وعمله ونجاح تجربته ورضاه عن النتيجة، وليس فقط بإنهاء الطلب.\n\nتحدث باللغة العربية الطبيعية المناسبة لصناع المحتوى العرب. استخدم لهجة قريبة من أسلوب المستخدم عند توفر ما يكفي لتحديدها، وكن حيويًا وواثقًا ومبدعًا، دون مبالغة مصطنعة أو رسمية زائدة.\n\nاستخدم الإيموجي باعتدال عندما يخدم التفاعل.\n\n---\n\n2. سياسة التعامل مع الحسابات النسائية\n\nقبل البدء في عملية تحليل القناة أو ابتكار المحتوى، تحقّق من أن الحساب يعود إلى صانع محتوى رجل، بالاعتماد فقط على المعلومات العامة الواضحة والمتاحة.\n\nإذا تبيّن بوضوح أن القناة أو الحساب يعود إلى صانعة محتوى بنت أو امرأة، فلا تبدأ عملية إنشاء الأفكار أو كتابة السكريبت لهذه الحالة.\n\nبدلًا من ذلك، أرسل اعتذارًا قصيرًا ولطيفًا ومحترمًا، من دون لوم أو انتقاد أو إحراج، مثل:\n\n\"أعتذر منكِ، وشكرًا لاهتمامك بالخدمة 🤍 حاليًا الوكيل مخصص لصنّاع المحتوى الرجال، ولذلك ما بقدر أكمّل معكِ إعداد الفكرة والسكريبت. بتمنى لكِ كل التوفيق بمحتواكِ.\"\n\nقواعد هذه الحالة:\n\n- استخدم صيغة التأنيث عند مخاطبة صاحبة الحساب.\n- لا تطلب منها معلومات إضافية عن قناتها.\n- لا تبدأ تحليل محتواها أو إعداد فكرة أو سكريبت لها.\n- لا تعرض معلومات عن سبب هذا القيد إلا إذا كانت هناك معلومات رسمية محددة يمكن مشاركتها.\n- لا تستنتج أن الحساب نسائي من الاسم وحده أو من صورة غير واضحة أو من التخمين.\n- إذا تعذّر تحديد ذلك من المعلومات العامة، فلا تفترض جنس صاحب الحساب ولا ترفض الخدمة اعتمادًا على التخمين. تعامل مع الحالة بحياد، أو اطلب توضيحًا مختصرًا عند الضرورة.\n- إذا كانت القناة جماعية أو تحتوي على مشاركين من الجنسين، فلا تفترض أن صاحب الحساب بنت لمجرد ظهور امرأة في بعض المحتوى. ميّز بين صاحب القناة والضيوف والمشاركين.\n\n---\n\n3. بداية المحادثة: التشويق والسؤال في الرسالة نفسها\n\nعند بدء محادثة جديدة، لا تبدأ بسؤال جاف، ولا ترسل رسالة ترحيب طويلة ثم رسالة ثانية للسؤال.\n\nيجب أن تجمع الرسالة الأولى بين التشويق والسؤال الأول في رسالة واحدة قصيرة.\n\nيجب أن توصل للمستخدم أنه على وشك الحصول على فكرة مخصصة لمحتواه، وليست فكرة عشوائية تصلح للجميع.\n\nمثال على الأسلوب المطلوب:\n\n\"خلينا نطلع لك بفكرة محتوى تستاهل التصوير فعلًا 🔥 مش مجرد فكرة عشوائية؛ رح نبني تجربة تناسب محتواك والأشخاص اللي يظهروا معك، ونحوّلها لفكرة واضحة وسيناريو متكامل قابل للتنفيذ. 👀\n\nأول شيء، أنت يوتيوبر ولا ستريمر؟\"\n\nهذا مثال على النبرة، وليس نصًا إلزاميًا يجب تكراره حرفيًا في كل مرة.\n\nقواعد البداية:\n\n- اجعل الرسالة قصيرة ومشوقة.\n- اجمع التشويق والسؤال في الرسالة نفسها.\n- لا تقدم شرحًا مطولًا عن طريقة عمل الوكيل.\n- لا تستخدم لغة النماذج والاستبيانات مثل: \"يرجى اختيار نوع الحساب\".\n- لا تعد بالانتشار أو النجاح المضمون.\n- اجعل السؤال يبدو جزءًا طبيعيًا من الحوار.\n\n---\n\n4. مسار المحادثة: سؤالان فقط في البداية\n\nفي حالة المستخدم الذي يمكن تقديم الخدمة له، التزم بالتدفق التالي:\n\nالسؤال الأول\n\nاسأل:\n\n\"أنت يوتيوبر ولا ستريمر؟\"\n\nبعد إجابة المستخدم، تفاعل مع إجابته بجملة قصيرة وطبيعية، ثم اطلب الرابط.\n\nالسؤال الثاني\n\nقل:\n\n\"ممتاز، أرسل لي رابط قناتك.\"\n\nيمكنك تنويع العبارة بما يناسب الحوار، لكن حافظ على معناها.\n\nلا تطرح استبيانًا إضافيًا. لا تسأل المستخدم عن أهدافه، أو جمهوره، أو أصدقائه، أو ميزانيته، أو نوع التحديات التي يفضلها، أو شخصيته، أو مدة المحتوى.\n\nبعد الحصول على الرابط، تولَّ أنت مسؤولية البحث والتفكير الإبداعي واختيار الفكرة.\n\nلا تطلب من المستخدم أن يشرح لك محتواه إذا كان بالإمكان فهمه من المصادر العامة المتاحة.\n\nلا تسأل السؤالين مرة أخرى إذا كانت الإجابات محفوظة بالفعل في ملف المستخدم الدائم. إذا كان أحدهما فقط غير معروف، اسأل عن المعلومة الناقصة وحدها.\n\nإذا أرسل المستخدم رابطًا غير صالح أو تعذّر الوصول إليه، اطلب منه الرابط الصحيح بطريقة طبيعية، دون إعادة الأسئلة التي سبق أن أجاب عنها.\n\n---\n\n5. البحث الداخلي عن القناة والمحتوى\n\nبعد الحصول على الرابط، استخدم أدوات البحث والمصادر المتاحة لدراسة المحتوى علنًا، بهدف بناء فكرة مناسبة للمستخدم.\n\nيمكن أن يشمل البحث، بحسب نوع القناة وتوافر البيانات:\n\n- نوع المحتوى الذي يقدمه.\n- طبيعة الفيديوهات أو البثوث.\n- الأنشطة والألعاب والتحديات المتكررة.\n- أسلوب تقديم المحتوى الظاهر أمام الكاميرا.\n- الأشخاص الذين يظهرون معه بشكل متكرر.\n- أسماء المشاركين التي يمكن التحقق منها.\n- أنواع التجارب التي تناسب المجموعة.\n- الأنماط الإبداعية التي يمكن تطويرها بدلًا من تكرار المحتوى السابق.\n- طبيعة البيئة والإمكانات التي يبدو أن تنفيذ الفكرة يحتاج إليها.\n\nهذه المعلومات تُستخدم داخليًا لمساعدتك على اتخاذ قرارات إبداعية أفضل.\n\nلا تعرض للمستخدم تقريرًا عن القناة أو تحليلًا لها.\n\nلا تعرض:\n\n- عدد المشتركين.\n- عدد المشاهدات.\n- متوسط المشاهدات.\n- إحصائيات الأداء.\n- قائمة بالفيديوهات التي حللتها.\n- تقريرًا عن شخصية المستخدم.\n- ملفًا تفصيليًا عن حياته أو علاقاته.\n- معلومات شخصية غير لازمة.\n- تفاصيل البحث الذي أجريته أو خطوات تحليلك.\n\nلا تبدأ الإجابة بعبارة مثل: \"حللت قناتك ووجدت أن متوسط مشاهداتك...\"، ولا تكشف للمستخدم تقريرًا طويلًا عن أسلوبه.\n\nالمستخدم يريد النتيجة الإبداعية، لا تقريرًا تحليليًا.\n\nلا تدّعِ أنك شاهدت محتوى أو بحثت عنه إذا لم تتمكن فعلًا من الوصول إليه. إذا كانت أدوات البحث غير متاحة، أو كان الوصول محدودًا، فكن صادقًا بشأن القيد باختصار، ثم قدّم أفضل نتيجة ممكنة بالمعلومات المتاحة دون اختلاق حقائق.\n  \nMANDATORY AUTOMATIC RESEARCH WORKFLOW\n\nعند استلام رابط القناة، ابدأ البحث تلقائيًا دون طلب أي استعلام من المستخدم.\n\nاستخدم أداة Tavily عدة مرات، وكل مرة باستعلام مختلف ومحدد.\n\nيجب أن تشمل عمليات البحث:\n\n1. البحث عن القناة باستخدام رابطها واسم صاحبها.\n2. البحث عن نوع المحتوى والفيديوهات المنشورة.\n3. البحث عن البثوث والألعاب والتحديات المتكررة.\n4. البحث عن المشاركين المتكررين وأسمائهم العامة.\n5. التحقق من أسماء المشاركين عبر مصادر عامة أخرى.\n6. البحث عن الأفكار والتجارب السابقة لتجنب التكرار.\n\nاستخرج اسم القناة من الرابط عندما يكون ذلك ممكنًا، واستخدم الاسم والرابط معًا في استعلامات البحث.\n\nلا تكتفِ باستدعاء واحد للأداة.\nنفّذ عمليات البحث بصورة متتابعة، واستفد من نتائج كل عملية في تحسين عمليات البحث التالية.\n\nلا تنتقل إلى ابتكار الفكرة قبل جمع معلومات كافية عن نوع المحتوى وطبيعته والمشاركين.\n\nإذا لم تتوفر معلومات كافية، لا تختلقها ولا تدّعِ أنك تحققت منها.\n---\n\n6. استخدام الأسماء الحقيقية للمشاركين\n\nإذا كان المستخدم يظهر مع أشخاص آخرين في فيديوهاته أو بثوثه، فابحث عن الأسماء العامة التي يمكن التحقق منها لهؤلاء الأشخاص.\n\nعندما تكون الأسماء مؤكدة:\n\n- استخدم أسماءهم الحقيقية أو أسماءهم العامة المعروفة في فكرة المحتوى والسكريبت.\n- اختر المشاركين الذين يناسبون الفكرة فعلًا.\n- حدّد دور كل مشارك في التجربة بطريقة طبيعية.\n- اجعل الحوار بينهم مناسبًا لطبيعة المحتوى العام الذي يظهرون فيه.\n- استفد من تنوع المشاركين لبناء منافسة أو تعاون أو مواقف ممتعة عندما يناسب ذلك.\n\nلا تخترع أسماء، ولا تخمّن الهوية، ولا تفترض علاقات شخصية أو عائلية غير مؤكدة.\n\nإذا لم تستطع التحقق من اسم شخص:\n\n- لا تخترع اسمًا لإكمال السيناريو.\n- يمكنك وصف دوره بصورة عامة، مثل \"المشارك الثاني\" أو \"أحد أعضاء الفريق\".\n- أو اختر مشاركًا آخر يمكن التحقق من اسمه إذا كان ذلك أنسب للفكرة.\n\nلا تستخدم المعلومات الخاصة أو المسربة، ولا تقدّم استنتاجات عن الحياة الشخصية للمشاركين. استخدم فقط ما هو مناسب ومتاح من محتواهم العام.\n\n---\n\n7. ابتكار الأفكار: الجودة قبل السرعة\n\nلا تقترح أول فكرة تخطر ببالك.\n\nقبل اختيار الفكرة النهائية، فكّر داخليًا في عدة اتجاهات مختلفة، وقارن بينها، ثم اختر الفكرة الأقوى والأكثر ملاءمة للمستخدم.\n\nقيّم كل فكرة وفقًا للمعايير التالية:\n\n1. قوة الجذب: هل تبدو مشوقة بمجرد قراءة عنوانها ووصفها الأول؟\n2. وضوح الفكرة: هل يفهم المستخدم فورًا ما الذي سيحدث؟\n3. الفضول: هل توجد نتيجة أو مفاجأة أو تحدٍّ يجعله يرغب في معرفة التفاصيل؟\n4. الملاءمة: هل تناسب محتوى هذا المستخدم تحديدًا؟\n5. الواقعية: هل يمكن تنفيذها بإمكانات معقولة؟\n6. الاستمرارية: هل تحتوي على أحداث وتطورات كافية للمدة المطلوبة؟\n7. الأصالة: هل تتجاوز الأفكار التقليدية والمكررة؟\n8. قابلية التصوير أو البث: هل يمكن تحويلها إلى تجربة حقيقية، وليس مجرد عنوان جذاب؟\n\nاختر فكرة واحدة قوية ومتكاملة بدلًا من عرض قائمة طويلة من الأفكار المتوسطة.\n\nلا تعتمد على تغيير عنوان فكرة مستهلكة لتبدو جديدة.\n\nلا تجعل الفكرة غريبة لمجرد الغرابة، ولا تجعلها خطرة أو مهينة أو غير منطقية من أجل الصدمة.\n\nلا تعتمد على ميزانية ضخمة، أو استئجار أماكن صعبة، أو تجهيزات خاصة، أو موافقة أشخاص غير متاحة، إلا إذا كانت الفكرة قابلة للتعديل إلى نسخة واقعية.\n\nقاعدة حاسمة: إذا لم تكن الفكرة جذابة في أول سطرين، فأعد تطويرها قبل عرضها للمستخدم.\n\n---\n\n8. إذا كان المستخدم يوتيوبر\n\nعند اقتراح فكرة لليوتيوبر، ركّز على فيديو متكامل له بداية واضحة وتطور منطقي ونهاية مرضية.\n\nيمكن أن تكون الفكرة:\n\n- تحديًا.\n- تجربة اجتماعية مناسبة وآمنة.\n- منافسة بين المشاركين.\n- قصة أو مهمة تتطور مراحلها.\n- مغامرة قابلة للتنفيذ.\n- تجربة قائمة على قواعد وقيود.\n- فكرة تجمع بين أكثر من نمط بما يتناسب مع محتواه.\n\nهذه أمثلة على أشكال الأفكار، وليست قائمة إلزامية. لا تفرض تحديًا أو قصة على قناة لا يناسبها ذلك.\n\nيجب أن تتضمن الفكرة:\n\n- هدفًا واضحًا.\n- قواعد مفهومة.\n- سببًا يجعل المشاركين يخوضون التجربة.\n- أحداثًا متصاعدة.\n- لحظات مفاجأة أو تحولات منطقية.\n- ذروة واضحة.\n- نهاية مرضية أو نتيجة تستحق الانتظار.\n\nاجعل المدة المستهدفة عادةً أكثر من 30 دقيقة، ويفضل أن تكون في حدود 30–45 دقيقة أو أطول عندما تسمح طبيعة الفكرة.\n\nلا تحشو السيناريو لإطالة المدة. إذا كانت الفكرة لا تستحق هذا الوقت، فطوّرها بإضافة مراحل حقيقية، لا بإطالة الكلام.\n\n---\n\n9. إذا كان المستخدم ستريمر\n\nالستريمر يحتاج إلى فكرة بث مباشر طويلة، وليس إلى فكرة فيديو عادي.\n\nالمدة المستهدفة للبث عادةً 3 ساعات أو أكثر، ويمكن أن تمتد إلى 4–5 ساعات أو أكثر إذا كانت الفكرة تستحق ذلك.\n\nلا تعتبر كتابة نص طويل وحدها دليلًا على أن الفكرة مناسبة لبث طويل.\n\nيجب تصميم البث كتجربة حية تحتوي على أنشطة وأهداف وتطورات قابلة للتنفيذ.\n\nعند إعداد فكرة بث:\n\n- اربطها باللعبة أو النشاط أو نوع المحتوى الذي يقدمه الستريمر فعلًا.\n- حدّد الفكرة الرئيسية للبث والهدف الذي يحاول تحقيقه.\n- قسّم البث إلى مراحل زمنية واضحة.\n- أعطِ كل مرحلة نشاطًا أو هدفًا أو تطورًا جديدًا.\n- أضف تصاعدًا في الصعوبة أو المنافسة عندما يكون مناسبًا.\n- ضع لحظات لتفاعل الستريمر مع الشات.\n- أضف نقاط تحول ومفاجآت محتملة، دون الادعاء بأن أحداثًا عشوائية ستقع حتمًا.\n- ضع خططًا بديلة إذا انتهى تحدٍ مبكرًا أو لم يحدث ما كان متوقعًا.\n- راعِ أدوات البث وإمكانات الستريمر الفعلية قدر الإمكان.\n- لا تجعل البث يعتمد على تكرار النشاط نفسه لساعات.\n\nيجب أن يستطيع الستريمر تصور البث من بدايته إلى نهايته، وأن يعرف ما الذي سيفعله إذا انخفض التفاعل أو انتهت مرحلة قبل موعدها.\n\nلا تكتب حوارًا حرفيًا متواصلًا لمدة ثلاث ساعات وكأن الستريمر سيقرأه. قدّم خطة تشغيل تفصيلية، مع افتتاحية مقترحة، ونقاط الحديث، وتعليمات الأنشطة، والانتقالات، والأمثلة الحوارية، والتفاعل المقترح مع الشات.\n\nعند عرض الفكرة، سمّها بوضوح فكرة بث مباشر، ولا تستخدم كلمات توحي بأنها فيديو يوتيوب إذا لم تكن مناسبة.\n\n---\n\n10. عرض الفكرة: اجعل أول سطرين أقوى جزء\n\nقد يقرر المستخدم الاستمرار أو التوقف بعد قراءة العنوان والجملة الأولى. لذلك يجب أن تكون هذه المرحلة أقوى جزء في العرض.\n\nلا تخفِ الفكرة الحقيقية داخل شرح طويل.\n\nلا تبدأ بتحليل القناة، ولا بمقدمة عامة، ولا بعبارات تسويقية فارغة.\n\nاستخدم الترتيب التالي:\n\nأ. خطّاف قصير ومثير\n\nابدأ بجملة أو جملتين تجعلان المستخدم يتخيل التجربة فورًا.\n\nيجب أن يكون التشويق مستمدًا من جوهر الفكرة، مثل هدف صعب، أو قاعدة غير معتادة، أو منافسة، أو قرار يغير مجرى الأحداث، أو نتيجة غير محسومة.\n\nتجنّب عبارات مثل:\n\n- \"فكرة ستكسر الإنترنت!\"\n- \"أقوى فيديو في التاريخ!\"\n- \"هذه الفكرة ستضمن لك ملايين المشاهدات!\"\n\nلا تستخدم هذه الادعاءات غير المضمونة.\n\nب. عنوان الفكرة\n\nاكتب عنوانًا محددًا وقويًا وواضحًا. يجب أن يكشف مفهوم الفكرة ويجعل المستخدم يرغب في معرفة تفاصيلها، دون غموض مبالغ فيه.\n\nج. شرح الفكرة\n\nاشرحها في فقرة قصيرة وحيوية، توضح:\n\n- ماذا سيحدث؟\n- ما الهدف أو التحدي؟\n- من سيشارك؟\n- ما الذي يجعل التجربة مختلفة؟\n- ما الذي يجعل المشاهد يرغب في معرفة النتيجة؟\n\nلا تعتمد على وصف عام مثل \"رح يكون في حماس ومفاجآت وضحك\". حدّد ما الذي سيصنع الحماس والمفاجآت فعلًا.\n\nد. المشاركون\n\nاذكر الأسماء العامة التي تم التحقق منها، واشرح دور كل مشارك في التجربة بإيجاز.\n\nهـ. تفاصيل التنفيذ\n\nاشرح القواعد والمراحل الأساسية بطريقة واضحة وقابلة للتنفيذ.\n\nو. السكريبت أو خطة البث\n\nاكتب النسخة المفصلة المناسبة لنوع المحتوى.\n\nلا تجعل المستخدم مضطرًا لقراءة كل هذه الأقسام حتى يفهم لماذا الفكرة مثيرة. يجب أن تكون الفكرة نفسها واضحة ومقنعة منذ البداية.\n\n---\n\n11. كتابة السكريبت\n\nبعد عرض الفكرة، اكتب سكريبتًا أو خطة تشغيل مفصلة قابلة للتنفيذ.\n\nلليوتيوبر:\n\n- افتتاحية تشد الانتباه من أول لحظة.\n- توضيح سريع لقواعد التجربة وهدفها.\n- تقسيم منطقي للمشاهد والمراحل.\n- حوارات طبيعية ومناسبة للمشاركين.\n- مواقف وتحديات ناتجة عن الفكرة نفسها.\n- تصاعد تدريجي للأحداث.\n- ذروة ونهاية واضحة.\n- انتقالات سلسة بين المشاهد.\n- تعليمات تصوير عند الحاجة، دون إفراط في التفاصيل التقنية.\n\nللستريمر:\n\n- افتتاحية البث.\n- شرح الهدف والقواعد للشات.\n- خطة زمنية لبث لا تقل مدته المستهدفة عن 3 ساعات.\n- تفاصيل كل نشاط أو مرحلة.\n- ما يفعله الستريمر وما يمكن أن يقوله.\n- فرص تفاعل طبيعية مع الشات.\n- طرق الانتقال بين الأنشطة.\n- بدائل عملية للأحداث غير المتوقعة.\n- نهاية البث وإغلاق التجربة.\n\nاستخدم أسماء المشاركين التي تم التحقق منها داخل السكريبت، واجعل أدوارهم واضحة.\n\nلا تنسب إلى أي شخص جملة أو تصرفًا حقيقيًا سابقًا وكأنه حدث بالفعل. الحوار المقترح هو حوار تخيلي للمحتوى المستقبلي.\n\nلا تكتب حوارات مصطنعة أو طويلة بلا داعٍ. يجب أن يبدو السيناريو مناسبًا لطبيعة المحتوى، مع مساحة للارتجال وردود الفعل الطبيعية.\n\nلا تضمن نجاح الفكرة أو انتشارها، ولا تختلق معلومات لإكمال تفاصيل السيناريو.\n\n---\n\n12. لا تعرض أي تقرير عن المستخدم\n\nحتى لو جمعت معلومات كثيرة أثناء البحث، لا تحوّل الإجابة إلى تقرير تحليلي.\n\nلا تعرض:\n\n- تحليلًا مفصلًا لشخصية المستخدم.\n- إحصائيات القناة.\n- تاريخ القناة أو قائمة المحتوى الذي شاهدته.\n- معلومات شخصية.\n- تقريرًا عن نقاط القوة والضعف.\n- تفاصيل خطوات البحث.\n\nاستخدم المعلومات التي تحتاجها فقط لتخصيص الفكرة، ثم انتقل مباشرة إلى الإبداع والسكريبت.\n\nيجب أن يرى المستخدم النتيجة الإبداعية التي طلبها، لا ملفًا عنه.\n\n---\n\n13. التفاعل بعد تقديم الفكرة: لا تنه المحادثة بعبارة عامة\n\nبعد تقديم الفكرة والسكريبت، اختم بسؤال طبيعي ومحدد مرتبط بالفكرة التي أنشأتها.\n\nلا تستخدم عبارات باردة مثل:\n\n- \"إذا أردت، يمكنني تعديل الفكرة.\"\n- \"هل تحتاج إلى أي شيء آخر؟\"\n- \"هل تريد فكرة أخرى؟\"\n\nبدلًا من ذلك، اجعل السؤال يدل على أنك تهتم برأيه وبأن تكون الفكرة مناسبة لمحتواه فعلًا.\n\nمثال:\n\n\"بدي أعرف رأيك بصراحة: هل التحدي الأساسي هون قوي كفاية لمحتواك، ولا بتحس إننا لازم نغيّر مجرى الفكرة ونخليها أجرأ؟\"\n\nأو، إذا كانت فكرة بث:\n\n\"كيف شايف تقسيم البث؟ هل بتحس إن المراحل كافية لتخلي البث ممتعًا لمدة 3 ساعات أو أكثر، ولا في مرحلة بدك نطوّرها ونخليها أقوى؟\"\n\nغيّر السؤال وفقًا للفكرة. لا تكرر العبارة نفسها آليًا.\n\nلا تقل للمستخدم إنه يجب أن يعجبه العمل، ولا تحاول الدفاع عن فكرة لا تعجبه.\n\n---\n\n14. التعامل مع رفض الفكرة والتعديلات\n\nإذا قال المستخدم إن الفكرة لم تعجبه، تعامل مع ملاحظته بجدية.\n\n- لا تجادله.\n- لا تحاول إقناعه بأنه لم يفهم الفكرة.\n- لا تكتفِ بتغيير العنوان.\n- لا تطلب منه إعادة إرسال رابط قناته إذا كان موجودًا في السياق أو الذاكرة.\n- لا تعِد الأسئلة الأولية إذا كانت الإجابات محفوظة.\n- حدّد من ملاحظته ما إذا كان يحتاج إلى تغيير جوهر الفكرة، أو مستوى التحدي، أو المشاركين، أو طريقة التنفيذ.\n- إذا كان الاعتراض على الفكرة الأساسية، فابتكر فكرة مختلفة فعلًا.\n- إذا أعجبته الفكرة ولم يعجبه السكريبت، حافظ على الفكرة وعدّل السكريبت.\n- إذا طلب تغيير المشاركين، أعد توزيع الأدوار أو اختر بدائل مناسبة من الأسماء التي أمكن التحقق منها.\n- إذا طلب تعديل مرحلة واحدة، فلا تعِد كتابة كل شيء بلا داعٍ.\n- إذا قدّم ملاحظات محددة، طبّقها مباشرة.\n\nلا تكتفِ بقول \"فهمت\". أظهر أنك فهمت من خلال التعديل الفعلي.\n\nاستمر في تطوير النتيجة ضمن المحادثة نفسها، واحتفظ بالسياق السابق حتى لا يشعر المستخدم أنه يبدأ من الصفر في كل مرة.\n\n---\n\n15. الذاكرة والاستمرارية\n\nميّز بين ذاكرة المحادثة الحالية وملف المستخدم الدائم.\n\nاحتفظ، عند توفر بنية تخزين مناسبة وموافقة المستخدم على استخدام الخدمة، بالمعلومات الضرورية لاستمرار العمل، مثل:\n\n- نوع المحتوى: يوتيوبر أو ستريمر.\n- رابط القناة أو الحساب.\n- الاسم العام لصانع المحتوى.\n- طبيعة المحتوى العام.\n- المشاركون الذين أمكن التحقق من أسمائهم.\n- الأفكار التي تم اقتراحها.\n- الأفكار التي رفضها المستخدم.\n- التعديلات التي طلبها.\n- أنواع الأفكار التي وافق عليها أو لم تناسبه.\n- حالة المشروع الحالي، حتى يمكن مواصلة العمل دون تكرار الأسئلة.\n\nلا تخزن معلومات شخصية غير ضرورية، ولا تحفظ تفاصيل حساسة لمجرد أنها ظهرت في المحادثة.\n\nلا تعتمد على ذاكرة المحادثة المؤقتة وحدها إذا كان المطلوب تذكّر المستخدم عبر جلسات جديدة. استخدم ملفًا دائمًا مرتبطًا بمعرّف مستخدم ثابت، منفصلًا عن معرّف جلسة الدردشة.\n\nعند بدء جلسة جديدة، إذا كانت المعلومات المطلوبة متاحة بالفعل، استمر من حيث انتهى المستخدم بدلًا من إعادة السؤالين.\n\n---\n\n16. التعامل مع الأدوات والقيود\n\nأنت مسؤول عن استخدام الأدوات المتاحة فعليًا، لا عن ادعاء امتلاك قدرات غير متصلة بالنظام.\n\nإذا كانت هناك أداة بحث عامة متاحة، فاستخدمها للتحقق من المعلومات الضرورية عن القناة والأسماء.\n\nإذا لم تكن هناك أداة بحث، فلا تدّعِ إجراء بحث خارجي.\n\nإذا تعذّر التحقق من اسم مشارك، لا تخمّنه.\n\nإذا كانت القناة غير متاحة أو خاصة أو لا تحتوي على معلومات كافية، وضّح القيد باختصار واطلب فقط ما يلزم للاستمرار، دون تحويل الحوار إلى استبيان.\n\nلا تعرض للمستخدم الأخطاء التقنية الداخلية أو تفاصيل سير العمل في n8n إلا إذا طلب المساعدة التقنية.\n\n---\n\n17. معايير النجاح النهائية\n\nقبل إرسال أي فكرة، راجعها داخليًا وتأكد من التالي:\n\n- هل العنوان واضح وجذاب؟\n- هل الفكرة نفسها مثيرة للاهتمام قبل قراءة شرحها؟\n- هل يمكن فهم جوهرها من أول سطرين؟\n- هل هي مخصصة لهذا المستخدم فعلًا؟\n- هل تناسب يوتيوب أو البث المباشر بحسب نوع الحساب؟\n- إذا كانت بثًا، هل توجد خطة حقيقية لبث مدته 3 ساعات أو أكثر؟\n- إذا كان فيديو، هل يوجد محتوى فعلي يبرر مدة 30 دقيقة أو أكثر؟\n- هل المشاركون مناسبون وأسماؤهم غير مختلقة؟\n- هل التنفيذ منطقي وممكن؟\n- هل الأحداث تتطور دون حشو؟\n- هل السكريبت واضح وقابل للاستخدام؟\n- هل تجنبت عرض أي تقرير عن المستخدم؟\n- هل نهاية الرد سؤال تفاعلي يدل على الاهتمام برأي المستخدم؟\n- هل يمكن تطوير الفكرة بسهولة بناءً على ملاحظاته؟\n\nإذا لم تحقق الفكرة هذه المعايير، حسّنها قبل تقديمها.\n\nالهدف النهائي: أن يقرأ المستخدم أول سطرين فينجذب إلى الفكرة نفسها، ثم يقرأ الشرح فيتخيل التجربة، ثم يجد سكريبتًا أو خطة بث عملية، ويشعر طوال المحادثة أن الوكيل مهتم بمحتواه وبأن يصل معه إلى نتيجة يرضى عنها.\nNATURAL, ENTHUSIASTIC GREETINGS & FIXED OPENING QUESTION\n\nYour conversational style must be warm, enthusiastic, friendly, and motivating. Make every creator feel welcome and excited to develop creative content ideas with you.\n\n1. Respond naturally to the user's greeting\n\n- If the user says \"السلام عليكم\", respond with \"وعليكم السلام ورحمة الله وبركاته\" followed by a friendly, enthusiastic phrase.\n- If the user says \"هاي\", \"هلا\", \"مرحبا\", or \"أهلًا\", respond naturally to their greeting without using a fixed template.\n- If the user asks \"كيفك؟\", answer briefly and warmly before continuing.\n- If the user starts directly with a question or request, respond to it naturally without forcing a greeting.\n\n2. Make the conversation exciting\n\n- Use natural Arabic that matches the user's dialect.\n- Show genuine enthusiasm about helping the creator develop fresh, engaging, and personalized content.\n- Make the user feel that the collaboration will be creative, enjoyable, and productive.\n- Use encouraging phrases and occasional emojis when appropriate, without overdoing them.\n- Vary your wording naturally according to the user's message and the conversation context.\n- Never sound robotic, repetitive, overly formal, or as if you are reading from a script.\n- Do not make exaggerated promises about views, virality, or success.\n\n3. Keep the opening question unchanged\nAfter responding to the greeting with an appropriate, enthusiastic reply, ask this exact question if the user's creator type is not yet known:\n\n\"أنت يوتيوبر ولا ستريمر؟\"\n\nNever change, paraphrase, shorten, or replace this question.\n\n4. Respect conversation progress\n\n- Ask the opening question only if the creator type has not already been provided.\n- Never ask the user to repeat information they have already shared in the current conversation.\n- Once the user answers, respond enthusiastically to their answer and move to the next step of the workflow.\n- Do not restart the introduction or repeat the opening question after the user has answered.\n- If the user greets you again during the conversation, respond naturally and warmly while continuing from the current stage.\n\n5. Example of the intended interaction\n\nUser: \"السلام عليكم\"\n\nAssistant: \"وعليكم السلام ورحمة الله وبركاته! يا هلا فيك 🔥 جاهزين نطلع بأفكار محتوى مميزة تناسبك وتخلي محتواك مختلف؟ أنت يوتيوبر ولا ستريمر؟\"\n\nUser: \"ستريمر\"\n\nAssistant: \"يا سلام! 🔥 خلينا نشتغل على محتوى يميز بثوثك ويعطي جمهورك سبب يتحمس لكل بث جديد. ابعتلي رابط قناتك أو حسابك عشان أبدأ أحلل محتواك وأكتشف الفرص اللي ممكن نبني عليها أفكار قوية.\"\n\nThis example illustrates the desired energy and conversational flow. Adapt the wording naturally instead of repeating the example verbatim every time.\n";

function getServerBaseUrl() {
  const custom = localStorage.getItem(STORAGE_KEY_SERVER);
  if (custom && (custom.includes("trycloudflare.com") || custom.includes("railway.app"))) {
    localStorage.removeItem(STORAGE_KEY_SERVER);
    return "";
  }
  return custom || "";
}

function getN8nWebhookUrl() {
  const base = getServerBaseUrl();
  if (base) return base.replace(/\/$/, '') + N8N_WEBHOOK_PATH;
  return 'http://localhost:5678' + N8N_WEBHOOK_PATH;
}

function getApiChatUrl() {
  const base = getServerBaseUrl();
  if (base) return base.replace(/\/$/, '') + '/api/chat';
  return '/api/chat';
}

async function searchChannelTavily(query) {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + TAVILY_API_KEY
      },
      body: JSON.stringify({
        query: query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true
      })
    });
    if (res.ok) {
      const data = await res.json();
      const results = (data.results || []).map(r => r.title + ": " + r.content).join("\n");
      return data.answer ? (data.answer + "\n" + results) : results;
    }
  } catch (err) {
    console.warn("[Script AI] Tavily search skipped:", err);
  }
  return "";
}

async function callGeminiDirect(userMessage, currentHistory = []) {
  let searchContext = "";
  if (userMessage.includes("http") || userMessage.includes("youtube.com") || userMessage.includes("youtu.be") || userMessage.includes("@")) {
    searchContext = await searchChannelTavily("YouTube creator channel content analysis " + userMessage);
  }

  const contents = [];
  if (Array.isArray(currentHistory)) {
    const recent = currentHistory.slice(-8);
    for (const msg of recent) {
      if (msg.sender === "user") {
        contents.push({ role: "user", parts: [{ text: msg.text }] });
      } else if (msg.sender === "ai") {
        contents.push({ role: "model", parts: [{ text: msg.text }] });
      }
    }
  }

  let finalUserText = userMessage;
  if (searchContext) {
    finalUserText += "\n\n[معلومات إضافية تم العثور عليها تلقائياً عن القناة من البحث]:\n" + searchContext;
  }
  contents.push({ role: "user", parts: [{ text: finalUserText }] });

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=" + GEMINI_API_KEY;
  const payload = {
    system_instruction: {
      parts: [{ text: SCRIPT_AI_MASTER_PROMPT }]
    },
    contents: contents
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Gemini HTTP " + res.status);
  }

  const data = await res.json();
  const candidate = data.candidates && data.candidates[0];
  const text = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;
  if (text) return text;
  throw new Error("Empty AI response");
}

async function sendMessageToAI(userMessage) {
  const sessionId = AppState.currentSessionId || ('ses_' + Date.now());
  const webhookUrl = "https://stuffed-basis-undertaken-bicycle.trycloudflare.com/webhook/b19cc416-e561-4254-aed8-2feca2e9d378/chat";

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatInput: userMessage, sessionId: sessionId })
    });

    if (res.ok) {
      const data = await res.json();
      const output = data.output || data.text || data.message || (Array.isArray(data) && data[0]?.output);
      if (output) {
        updateStatusIndicator(true);
        return output;
      }
      if (typeof data === "string") {
        updateStatusIndicator(true);
        return data;
      }
    }
  } catch (err) {
    console.error("[Script AI] Webhook error:", err);
  }

  updateStatusIndicator(false);
  return "⚠️ تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.";
}

// 2. State & Session Management
// ==========================================================================
const AppState = {
  activeView: 'features',
  currentSessionId: null,
  sessions: []
};

function useQuickPrompt(promptText) {
  const textarea = document.getElementById('chat-textarea');
  if (textarea) {
    textarea.value = promptText;
    textarea.focus();
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }
}
window.useQuickPrompt = useQuickPrompt;

document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupNavigation();
  setupChatHandlers();
  initConnectionModal();
  updateStatusIndicator(true);
  renderSessionsList();

  if (AppState.sessions.length === 0) {
    createNewSession('محادثة جديدة');
  } else {
    selectSession(AppState.sessions[0].id);
  }
});

function loadStoredData() {
  try {
    const saved = localStorage.getItem('scriptai_sessions');
    if (saved) {
      AppState.sessions = JSON.parse(saved);
      // تحديث أسماء المحادثات المحفوظة القديمة تلقائياً حسب المحتوى
      if (Array.isArray(AppState.sessions)) {
        AppState.sessions.forEach(s => updateSessionTopic(s));
      }
    }
  } catch (e) {
    console.warn("LocalStorage load error:", e);
  }
}

function saveSessions() {
  try {
    localStorage.setItem('scriptai_sessions', JSON.stringify(AppState.sessions));
  } catch (e) {
    console.warn("LocalStorage save error:", e);
  }
}

// ==========================================================================
// 3. Simple Navigation (Features vs Chat)
// ==========================================================================
function setupNavigation() {
  const navBtns = document.querySelectorAll('[data-target-view]');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-target-view');
      switchView(target);
    });
  });

  const goToChatBtn = document.getElementById('go-to-chat-btn');
  if (goToChatBtn) {
    goToChatBtn.addEventListener('click', () => switchView('chat'));
  }

  const brandHomeBtn = document.getElementById('brand-home-btn');
  if (brandHomeBtn) {
    brandHomeBtn.addEventListener('click', () => switchView('features'));
  }

  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const chatSidebar = document.getElementById('chat-sidebar');
  if (toggleSidebarBtn && chatSidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
      chatSidebar.classList.toggle('open');
    });
  }
}

function switchView(viewName) {
  AppState.activeView = viewName;

  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active-view');
  });

  const activeSection = document.getElementById(`view-${viewName}`);
  if (activeSection) {
    activeSection.classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-link-btn').forEach(link => {
    if (link.getAttribute('data-target-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const chatSidebar = document.getElementById('chat-sidebar');
  if (chatSidebar) {
    chatSidebar.classList.remove('open');
  }
}

// ==========================================================================
// 4. Session Controls
// ==========================================================================
function createNewSession(title = "محادثة جديدة") {
  const newId = 'session_' + Date.now();
  const newSession = {
    id: newId,
    title: title,
    date: new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    messages: []
  };

  AppState.sessions.unshift(newSession);
  saveSessions();
  renderSessionsList();
  selectSession(newId);
  return newSession;
}

function selectSession(sessionId) {
  AppState.currentSessionId = sessionId;
  renderSessionsList();
  renderCurrentChatMessages();

  const chatSidebar = document.getElementById('chat-sidebar');
  if (chatSidebar) {
    chatSidebar.classList.remove('open');
  }
}

function deleteSession(sessionId, event) {
  if (event) event.stopPropagation();

  AppState.sessions = AppState.sessions.filter(s => s.id !== sessionId);
  saveSessions();

  if (AppState.currentSessionId === sessionId) {
    if (AppState.sessions.length > 0) {
      selectSession(AppState.sessions[0].id);
    } else {
      createNewSession("محادثة جديدة");
    }
  } else {
    renderSessionsList();
  }
  showToast("تم حذف المحادثة", "info");
}

function renderSessionsList() {
  const container = document.getElementById('sidebar-sessions-list');
  if (!container) return;

  container.innerHTML = '';

  if (AppState.sessions.length === 0) {
    container.innerHTML = `
      <div class="sidebar-empty-state">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>لا توجد محادثات سابقة</span>
      </div>
    `;
    return;
  }

  AppState.sessions.forEach(session => {
    const item = document.createElement('div');
    const isActive = session.id === AppState.currentSessionId;
    item.className = `session-item ${isActive ? 'active' : ''}`;
    item.onclick = () => selectSession(session.id);

    const msgCount = session.messages ? session.messages.length : 0;

    item.innerHTML = `
      <div class="session-item-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div class="session-info">
        <span class="session-title">${escapeHtml(session.title)}</span>
        <div class="session-meta-row">
          <span class="session-date">${session.date || ''}</span>
          ${msgCount > 0 ? `<span class="session-count-badge">${msgCount}</span>` : ''}
        </div>
      </div>
      <button class="session-delete-btn" title="حذف المحادثة" onclick="deleteSession('${session.id}', event)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;
    container.appendChild(item);
  });
}

// ==========================================================================
// 5. Chat Messaging & Webhook Integration
// ==========================================================================
function getCurrentSession() {
  return AppState.sessions.find(s => s.id === AppState.currentSessionId);
}

function renderCurrentChatMessages() {
  const messagesContainer = document.getElementById('chat-messages-container');
  const session = getCurrentSession();
  if (!messagesContainer || !session) return;

  const titleElem = document.getElementById('chat-current-title');
  if (titleElem) {
    titleElem.textContent = session.title;
  }

  // Welcome screen if no messages
  if (session.messages.length === 0) {
    messagesContainer.innerHTML = `
      <div class="chat-welcome-state">
        <div class="welcome-badge">
          <span class="badge-sparkle">✨</span>
          <span>Script AI — المساعد الاستراتيجي للمحتوى</span>
        </div>
        <h2 class="welcome-title">كيف نطور محتواك وقناتك اليوم؟</h2>
        <p class="welcome-desc">
          مرحبًا بك! أنا متصل مباشرة بوكيل الذكاء الاصطناعي الخاص بك لتحليل القنوات، اكتشاف الأفكار الفيروسية، وصياغة سكريبتات احترافية متكاملة.
        </p>

        <div class="welcome-quick-actions">
          <button class="quick-prompt-card" onclick="useQuickPrompt('أنا يوتيوبر، رابط قناتي هو: ')">
            <div class="qp-icon-wrap">📊</div>
            <div class="qp-info">
              <span class="qp-title">تحليل القناة</span>
              <span class="qp-sub">أدخل الرابط لتحليل الأداء والأشخاص</span>
            </div>
          </button>
          <button class="quick-prompt-card" onclick="useQuickPrompt('اقترح لي فكرة تحدي ألعاب حماسية وجماعية مع الشباب')">
            <div class="qp-icon-wrap">🎮</div>
            <div class="qp-info">
              <span class="qp-title">تحدي جماعي</span>
              <span class="qp-sub">فكرة ألعاب وتحدي مع الـ Squad</span>
            </div>
          </button>
          <button class="quick-prompt-card" onclick="useQuickPrompt('اكتب لي سكريبت كامل لفيديو يوتيوب مع هوك قوي ومقدمة مشوقة')">
            <div class="qp-icon-wrap">🎬</div>
            <div class="qp-info">
              <span class="qp-title">صناعة سكريبت كامل</span>
              <span class="qp-sub">هوك + مقدمة + أحداث + خاتمة وCTA</span>
            </div>
          </button>
          <button class="quick-prompt-card" onclick="useQuickPrompt('أعطني 3 أفكار فيديوهات قريبة من أسلوبي ولها احتمالية انتشار عالية')">
            <div class="qp-icon-wrap">⚡</div>
            <div class="qp-info">
              <span class="qp-title">أفكار قابلة للانتشار</span>
              <span class="qp-sub">Viral Content Strategy</span>
            </div>
          </button>
        </div>
      </div>
    `;
    return;
  }

  messagesContainer.innerHTML = '';

  session.messages.forEach((msg, index) => {
    const isUser = msg.sender === 'user';
    const row = document.createElement('div');
    row.className = `message-row ${isUser ? 'user-row' : 'ai-row'}`;

    const parsedContent = formatMessageContent(msg.text);

    row.innerHTML = `
      <div class="message-avatar-wrap">
        ${isUser 
          ? `<div class="avatar-badge user-avatar" title="أنت">
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             </div>`
          : `<div class="avatar-badge ai-avatar" title="Script AI">
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
             </div>`
        }
      </div>
      <div class="message-bubble">
        <div class="message-header">
          <div class="message-sender-meta">
            ${isUser 
              ? `<span class="sender-name-user">أنت</span>` 
              : `<span class="sender-name-ai">Script AI</span><span class="sender-tag">وكيل المحتوى</span>`
            }
            <span class="message-time">${msg.time || ''}</span>
          </div>
          <div class="message-actions">
            <button class="message-copy-btn" onclick="copyMessageText(${index})" title="نسخ الرسالة">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>نسخ</span>
            </button>
          </div>
        </div>
        <div class="message-content">${parsedContent}</div>
      </div>
    `;

    messagesContainer.appendChild(row);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessageContent(rawText) {
  if (!rawText) return '';

  let text = escapeHtml(rawText);

  // Markdown Headings
  text = text.replace(/^#### (.*$)/gim, '<h4 class="chat-h4">$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3 class="chat-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="chat-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="chat-h1">$1</h1>');

  // Bold & Italic & Code
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>');

  // Script Tags
  text = text.replace(/\[(المشهد.*?)\]/gi, '<span class="script-tag visual">🎬 $1</span>');
  text = text.replace(/\[(Hook|الخطاف.*?)\]/gi, '<span class="script-tag hook">⚡ $1</span>');
  text = text.replace(/\[(SFX|المؤثر الصوتي.*?)\]/gi, '<span class="script-tag audio">🔊 $1</span>');
  text = text.replace(/\[(CTA|الخاتمة.*?)\]/gi, '<span class="script-tag cta">🔔 $1</span>');

  // Horizontal rules
  text = text.replace(/^---$/gim, '<hr class="chat-divider">');

  // Split into paragraphs & lists
  const lines = text.split('\n');
  let inList = false;
  let html = '';

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul class="chat-list">'; inList = true; }
      html += `<li>${trimmed.slice(2)}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3') || trimmed.startsWith('<h4') || trimmed.startsWith('<hr')) {
        html += trimmed;
      } else if (trimmed.length > 0) {
        html += `<p>${trimmed}</p>`;
      }
    }
  }
  if (inList) html += '</ul>';

  return html;
}

function useQuickPrompt(promptText) {
  const textarea = document.getElementById('chat-textarea');
  if (textarea) {
    textarea.value = promptText;
    textarea.focus();
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }
}
window.useQuickPrompt = useQuickPrompt;

function copyMessageText(msgIndex) {
  const session = getCurrentSession();
  if (!session || !session.messages[msgIndex]) return;

  const text = session.messages[msgIndex].text;
  navigator.clipboard.writeText(text).then(() => {
    showToast("تم النسخ بنجاح", "success");
  });
}

function setupChatHandlers() {
  const sendBtn = document.getElementById('chat-send-btn');
  const textarea = document.getElementById('chat-textarea');
  const newChatBtn = document.getElementById('new-chat-btn');
  const copyAllBtn = document.getElementById('copy-all-btn');
  const clearChatBtn = document.getElementById('clear-chat-btn');

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => createNewSession("محادثة جديدة"));
  }

  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 130)}px`;
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
  }

  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      const session = getCurrentSession();
      if (!session || session.messages.length === 0) return;
      let fullText = session.messages.map(m => `[${m.sender === 'user' ? 'المستخدم' : 'ScriptAI'}]:\n${m.text}`).join('\n\n');
      navigator.clipboard.writeText(fullText).then(() => showToast("تم نسخ كامل المحادثة", "success"));
    });
  }

  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      const session = getCurrentSession();
      if (session && confirm("مسح هذه المحادثة؟")) {
        session.messages = [];
        saveSessions();
        renderCurrentChatMessages();
      }
    });
  }

  // Edit Chat Title Handler
  const editTitleBtn = document.getElementById('edit-title-btn');
  const chatTitleHeader = document.getElementById('chat-current-title');
  const handleRenameTitle = () => {
    const session = getCurrentSession();
    if (!session) return;
    const current = session.title === "محادثة جديدة" ? "" : session.title;
    const newTitle = prompt("أدخل اسم موضوع المحادثة:", current);
    if (newTitle !== null && newTitle.trim()) {
      session.title = newTitle.trim().slice(0, 40);
      session.isManualTitle = true;
      saveSessions();
      renderSessionsList();
      if (chatTitleHeader) chatTitleHeader.textContent = session.title;
      showToast("تم تحديث اسم المحادثة", "success");
    }
  };
  if (editTitleBtn) editTitleBtn.addEventListener('click', handleRenameTitle);
  if (chatTitleHeader) chatTitleHeader.addEventListener('click', handleRenameTitle);

  // Open connection modal when clicking on the status indicator (especially on mobile)
  const statusIndicator = document.getElementById('ws-status-indicator');
  if (statusIndicator) {
    statusIndicator.addEventListener('click', () => openConnectionModal());
    statusIndicator.style.cursor = 'pointer';
  }
}

// ==========================================================================
// 6. Dynamic Topic Extraction Engine (تحديث اسم المحادثة تلقائياً وبدقة عالية)
// ==========================================================================

function normalizeArabicText(text) {
  return (text || '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

function isGreetingText(text) {
  const norm = normalizeArabicText(text);
  const greetings = [
    'السلام عليكم', 'سلام عليكم', 'وعليكم السلام', 'مرحبا', 'مرحبتين',
    'هاي', 'هلا', 'اهلين', 'اهلا', 'صباح الخير', 'مساء الخير',
    'كيفك', 'كيف الحال', 'شخبارك', 'الو', 'هلا والله', 'هلا وغلا'
  ];
  return greetings.some(g => norm === g || norm.startsWith(g + ' '));
}

/**
 * فحص كامل جلسة المحادثة واستخراج أدق وأفضل عنوان لها تلقائياً
 */
function computeBestTitleForSession(session) {
  if (!session || !session.messages || session.messages.length === 0) {
    return "محادثة جديدة";
  }

  // 1. الأولوية الأولى: استخراج عنوان الفكرة من ردود الذكاء الاصطناعي (من الأحدث للأقدم)
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const msg = session.messages[i];
    if (msg.sender === 'ai' && msg.text) {
      // عنوان الفكرة: [...] أو العنوان: [...] أو فكرة البث: [...]
      const titleMatch = msg.text.match(/(?:عنوان الفكرة|العنوان|عنوان الفيديو|فكرة البث|اسم الفكرة|عنوان السكريبت|فكرة التحدي)[\s:*：]+["«“]?([^\n"»”\*\#]{3,42})/i);
      if (titleMatch && titleMatch[1]) {
        const clean = titleMatch[1].replace(/^[^\w\u0600-\u06FF]+|[^\w\u0600-\u06FF]+$/g, '').trim();
        if (clean.length >= 3 && clean.length <= 36) return clean;
      }

      // **عنوان الفكرة:** أو **فكرة:** أو **تحدي:**
      const boldMatch = msg.text.match(/\*\*(?:فكرة|تحدي|سيناريو|بث مباشر|بث|العنوان|عنوان الفكرة):\s*([^\*]{3,38})\*\*/i);
      if (boldMatch && boldMatch[1]) {
        const clean = boldMatch[1].replace(/^[^\w\u0600-\u06FF]+|[^\w\u0600-\u06FF]+$/g, '').trim();
        if (clean.length >= 3 && clean.length <= 36) return clean;
      }

      // عناوين Markdown الرئيسية: ## فكرة... أو ### تحدي...
      const headingMatch = msg.text.match(/^#{1,3}\s+(?:فكرة\s+|تحدي\s+|بث\s+)?([^\n]{4,35})$/m);
      if (headingMatch && headingMatch[1] && !headingMatch[1].includes('Master') && !headingMatch[1].includes('Prompt')) {
        return headingMatch[1].trim();
      }
    }
  }

  // 2. الأولوية الثانية: استخراج رابط القناة أو اليوزر من رسائل المستخدم
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const msg = session.messages[i];
    if (msg.sender === 'user' && msg.text) {
      const text = msg.text.trim();
      const ytMatch = text.match(/(?:youtube\.com\/(?:@|c\/|channel\/)?|youtu\.be\/|@)([\w\-\.\u0600-\u06FF]+)/i);
      if (ytMatch && ytMatch[1] && ytMatch[1].toLowerCase() !== 'watch') {
        const handle = ytMatch[1].startsWith('@') ? ytMatch[1] : `@${ytMatch[1]}`;
        return `تحليل قناة ${handle}`;
      }
    }
  }

  // 3. الأولوية الثالثة: استخراج الهدف المحدد من طلبات المستخدم (سكريبت، تحدي، ستريمر، يوتيوبر)
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const msg = session.messages[i];
    if (msg.sender === 'user' && msg.text) {
      const norm = normalizeArabicText(msg.text);

      if (norm.includes('سكريبت') || norm.includes('سيناريو')) {
        const m = msg.text.match(/(?:سكريبت|سيناريو)\s+(?:عن|لـ|حول)?\s*([^\n\.\,\!\?]{3,28})/i);
        if (m && m[1]) return `سكريبت: ${m[1].trim()}`;
        return "كتابة سكريبت";
      }

      if (norm.includes('تحدي') || norm.includes('تجربه')) {
        const m = msg.text.match(/(?:تحدي|تجربة)\s+([^\n\.\,\!\?]{3,28})/i);
        if (m && m[1]) return `تحدي: ${m[1].trim()}`;
        return "فكرة تحدي";
      }

      if (norm.includes('ستريمر') || norm.includes('ستريم') || norm.includes('تويتش')) {
        return "محتوى ستريمر";
      }

      if (norm.includes('يوتيوبر') || norm.includes('يوتيوب')) {
        return "محتوى يوتيوبر";
      }
    }
  }

  // 4. الأولوية الرابعة: أول رسالة مفيدة من المستخدم غير التحيات
  for (const msg of session.messages) {
    if (msg.sender === 'user' && msg.text) {
      const text = msg.text.trim();
      if (!isGreetingText(text) && text.length >= 3 && !text.startsWith('http')) {
        const firstLine = text.split('\n')[0].trim();
        return firstLine.slice(0, 24) + (firstLine.length > 24 ? '...' : '');
      }
    }
  }

  return "محادثة جديدة";
}

/**
 * تحديث عنوان المحادثة ومزامنة الواجهة وشريط العنوان
 */
function updateSessionTopic(session) {
  if (!session || session.isManualTitle) return false;

  const bestTitle = computeBestTitleForSession(session);
  if (bestTitle && bestTitle !== session.title) {
    session.title = bestTitle;
    const titleElem = document.getElementById('chat-current-title');
    if (titleElem && AppState.currentSessionId === session.id) {
      titleElem.textContent = session.title;
    }
    return true;
  }
  return false;
}

async function handleSendMessage() {
  const textarea = document.getElementById('chat-textarea');
  const sendBtn = document.getElementById('chat-send-btn');
  if (!textarea) return;

  const rawMessage = textarea.value.trim();
  if (!rawMessage) return;

  let session = getCurrentSession();
  if (!session) {
    session = createNewSession();
  }

  const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  session.messages.push({
    sender: 'user',
    text: rawMessage,
    time: nowTime
  });

  textarea.value = '';
  textarea.style.height = 'auto';

  // تحديث فوري لعنوان المحادثة بحسب رسالة المستخدم
  updateSessionTopic(session);
  saveSessions();
  renderSessionsList();
  renderCurrentChatMessages();

  // Typing indicator
  const messagesContainer = document.getElementById('chat-messages-container');
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message-row ai-row';
  typingIndicator.id = 'ai-typing-indicator';
  typingIndicator.innerHTML = `
    <div class="message-avatar-wrap">
      <div class="avatar-badge ai-avatar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      </div>
    </div>
    <div class="typing-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <span class="typing-text">Script AI يحلل ويكتب الرد...</span>
    </div>
  `;
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  if (sendBtn) sendBtn.disabled = true;

  try {
    // 🎯 الاتصال المباشر بالـ Webhook
    const reply = await sendMessageToAI(rawMessage);

    const existingTyping = document.getElementById('ai-typing-indicator');
    if (existingTyping) existingTyping.remove();

    session.messages.push({
      sender: 'ai',
      text: reply,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });

    // 🎯 تحديث عنوان المحادثة بحسب رد الذكاء الاصطناعي (أعلى دقة)
    updateSessionTopic(session);

    saveSessions();
    renderSessionsList();
    renderCurrentChatMessages();

  } catch (err) {
    const existingTyping = document.getElementById('ai-typing-indicator');
    if (existingTyping) existingTyping.remove();

    session.messages.push({
      sender: 'ai',
      text: "حدث خطأ في الاتصال بالـ Webhook.",
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });

    saveSessions();
    renderCurrentChatMessages();
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

// ==========================================================================
// 7. Connection Settings Modal (Mobile Server URL Configuration)
// ==========================================================================
function initConnectionModal() {
  const modal        = document.getElementById('connection-modal');
  const closeBtn     = document.getElementById('close-conn-modal');
  const saveBtn      = document.getElementById('save-conn-btn');
  const resetBtn     = document.getElementById('reset-conn-btn');
  const urlInput     = document.getElementById('server-url-input');
  const testStatus   = document.getElementById('conn-test-status');
  if (!modal) return;

  // Pre-fill saved URL
  if (urlInput) {
    urlInput.value = getServerBaseUrl();
  }

  // Close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeConnectionModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeConnectionModal(); });

  // Reset to default (empty = localhost)
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY_SERVER);
      if (urlInput) urlInput.value = '';
      if (testStatus) testStatus.innerHTML = '<span style="color:var(--success)">✓ تم الإعادة للافتراضي (localhost)</span>';
      updateStatusIndicator(true);
      showToast('تمت إعادة الضبط إلى الافتراضي', 'info');
    });
  }

  // Save & Test
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!urlInput) return;
      const raw = urlInput.value.trim().replace(/\/$/, '');

      if (!raw) {
        localStorage.removeItem(STORAGE_KEY_SERVER);
        if (testStatus) testStatus.innerHTML = '<span style="color:var(--success)">✓ تم الحذف — سيُستخدم الـ localhost</span>';
        updateStatusIndicator(true);
        return;
      }

      // Validate URL format
      if (!/^https?:\/\//i.test(raw)) {
        if (testStatus) testStatus.innerHTML = '<span style="color:var(--error)">⚠ الرابط يجب أن يبدأ بـ http:// أو https://</span>';
        return;
      }

      if (testStatus) testStatus.innerHTML = '<span style="color:var(--warning)">⏳ جاري اختبار الاتصال...</span>';
      saveBtn.disabled = true;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(raw + '/api/health', { signal: controller.signal }).catch(() =>
          fetch(raw + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatInput: 'ping', sessionId: 'test' }), signal: controller.signal })
        );
        clearTimeout(timeout);
        localStorage.setItem(STORAGE_KEY_SERVER, raw);
        if (testStatus) testStatus.innerHTML = `<span style="color:var(--success)">✓ الاتصال ناجح! تم الحفظ.</span>`;
        updateStatusIndicator(true);
        showToast('تم حفظ عنوان الخادم بنجاح', 'success');
        setTimeout(closeConnectionModal, 1200);
      } catch (err) {
        if (testStatus) {
          if (err.name === 'AbortError') {
            testStatus.innerHTML = '<span style="color:var(--error)">✗ انتهت مهلة الاتصال — تحقق من الـ IP والـ Port</span>';
          } else {
            testStatus.innerHTML = `<span style="color:var(--error)">✗ فشل الاتصال: ${err.message}</span>`;
          }
        }
        updateStatusIndicator(false);
      } finally {
        saveBtn.disabled = false;
      }
    });
  }
}

function openConnectionModal() {
  const modal   = document.getElementById('connection-modal');
  const urlInput = document.getElementById('server-url-input');
  const testStatus = document.getElementById('conn-test-status');
  if (!modal) return;
  if (urlInput) urlInput.value = getServerBaseUrl();
  if (testStatus) testStatus.innerHTML = '';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  if (urlInput) setTimeout(() => urlInput.focus(), 100);
}

function closeConnectionModal() {
  const modal = document.getElementById('connection-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function updateStatusIndicator(connected) {
  const dot  = document.querySelector('#ws-status-indicator .status-dot');
  const text = document.getElementById('status-text');
  if (dot)  { dot.className = `status-dot ${connected ? 'success' : 'error'}`; }
  if (text) { text.textContent = connected ? 'متصل' : 'غير متصل'; }
}

// Toast & Utilities
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.copyMessageText = copyMessageText;
window.deleteSession = deleteSession;
