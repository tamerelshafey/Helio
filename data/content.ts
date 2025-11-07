import type { SiteContent, Quote } from '../types';

const quotesData: Quote[] = [
    {
        quote: {
            ar: "المنزل هو نقطة الانطلاق التي يبدأ منها الإنسان.",
            en: "Home is the starting place of love, hope and dreams."
        },
        author: {
            ar: "تشارلز هنري باركهورست",
            en: "Charles Henry Parkhurst"
        }
    },
    {
        quote: {
            ar: "لا يوجد شيء أكثر أهمية من منزل جيد.",
            en: "There is nothing more important than a good, safe, secure home."
        },
        author: {
            ar: "روزالين كارتر",
            en: "Rosalynn Carter"
        }
    },
    {
        quote: {
            ar: "قوة الأمة مستمدة من نزاهة البيت.",
            en: "The strength of a nation derives from the integrity of the home."
        },
        author: {
            ar: "كونفوشيوس",
            en: "Confucius"
        }
    },
    {
        quote: {
            ar: "المنزل ليس مجرد مكان، إنه شعور.",
            en: "Home is not a place, it's a feeling."
        },
        author: {
            ar: "سيسيليا أهيرن",
            en: "Cecelia Ahern"
        }
    },
    {
        quote: {
            ar: "البيوت تصنع بالأيدي، أما المنازل فتبنى بالقلوب.",
            en: "A house is made of walls and beams; a home is built with love and dreams."
        },
        author: {
            ar: "مجهول",
            en: "Unknown"
        }
    },
    {
        quote: {
            ar: "السعادة هي رائحة منزل جديد.",
            en: "The smell of a new house is the smell of happiness."
        },
        author: {
            ar: "مجهول",
            en: "Unknown"
        }
    },
     {
        quote: {
            ar: "امتلاك منزل هو حجر الزاوية للثروة.",
            en: "Owning a home is a keystone of wealth."
        },
        author: {
            ar: "فرانكلين روزفلت",
            en: "Franklin D. Roosevelt"
        }
    },
    {
        quote: {
            ar: "أفضل وقت لزرع شجرة كان قبل 20 عامًا. ثاني أفضل وقت هو الآن.",
            en: "The best time to plant a tree was 20 years ago. The second best time is now."
        },
        author: {
            ar: "مثل صيني",
            en: "Chinese Proverb"
        }
    },
    {
        quote: {
            ar: "يجب أن تتحدث العمارة عن زمانها ومكانها، ولكنها تتوق إلى الخلود.",
            en: "Architecture should speak of its time and place, but yearn for timelessness."
        },
        author: {
            ar: "فرانك جيري",
            en: "Frank Gehry"
        }
    },
    {
        quote: {
            ar: "جوهر التصميم الداخلي سيكون دائمًا عن الناس وكيف يعيشون، وليس عن الموضة.",
            en: "The essence of interior design will always be about people and how they live, not about fashion."
        },
        author: {
            ar: "ألبرت هادلي",
            en: "Albert Hadley"
        }
    },
    {
        quote: {
            ar: "لا تضع في منزلك شيئًا لا تعرف أنه مفيد، أو لا تعتقد أنه جميل.",
            en: "Have nothing in your house that you do not know to be useful, or believe to be beautiful."
        },
        author: {
            ar: "ويليام موريس",
            en: "William Morris"
        }
    },
    {
        quote: {
            ar: "البساطة هي قمة التطور.",
            en: "Simplicity is the ultimate sophistication."
        },
        author: {
            ar: "ليوناردو دافنشي",
            en: "Leonardo da Vinci"
        }
    },
    {
        quote: {
            ar: "نحن نشكل مبانينا، وبعد ذلك هي التي تشكلنا.",
            en: "We shape our buildings; thereafter they shape us."
        },
        author: {
            ar: "ونستون تشرشل",
            en: "Winston Churchill"
        }
    },
    {
        quote: {
            ar: "البناء الجيد يأتي من أناس طيبين، وكل المشاكل تُحل بالتصميم الجيد.",
            en: "Good building comes from good people, and all problems are solved by good design."
        },
        author: {
            ar: "ستيفن غاردينر",
            en: "Stephen Gardiner"
        }
    },
    {
        quote: {
            ar: "المنزل يجب أن يكون هو صندوق كنز الحياة.",
            en: "The home should be the treasure chest of living."
        },
        author: {
            ar: "لو كوربوزييه",
            en: "Le Corbusier"
        }
    },
    {
        quote: {
            ar: "التصميم ليس فقط ما يبدو عليه وما تشعر به. التصميم هو كيف يعمل.",
            en: "Design is not just what it looks like and feels like. Design is how it works."
        },
        author: {
            ar: "ستيف جوبز",
            en: "Steve Jobs"
        }
    },
    {
        quote: {
            ar: "الشوق إلى الوطن يعيش فينا جميعًا.",
            en: "The ache for home lives in all of us."
        },
        author: {
            ar: "مايا أنجيلو",
            en: "Maya Angelou"
        }
    },
    {
        quote: {
            ar: "اشترِ أرضًا، فهم لم يعودوا يصنعون المزيد منها.",
            en: "Buy land, they’re not making it anymore."
        },
        author: {
            ar: "مارك توين",
            en: "Mark Twain"
        }
    },
    {
        quote: {
            ar: "العمارة هي في الحقيقة عن الرفاهية. أعتقد أن الناس يريدون أن يشعروا بالرضا في مكان ما.",
            en: "Architecture is really about well-being. I think that people want to feel good in a space."
        },
        author: {
            ar: "زها حديد",
            en: "Zaha Hadid"
        }
    },
    {
        quote: {
            ar: "يمكن للطبيب أن يدفن أخطاءه، لكن المهندس المعماري لا يمكنه إلا أن ينصح عملاءه بزرع الكروم.",
            en: "The physician can bury his mistakes, but the architect can only advise his clients to plant vines."
        },
        author: {
            ar: "فرانك لويد رايت",
            en: "Frank Lloyd Wright"
        }
    },
    {
        quote: {
            ar: "هناك ثلاث استجابات لقطعة من التصميم - نعم، لا، وواو! واو هي التي يجب أن تستهدفها.",
            en: "There are three responses to a piece of design – yes, no, and WOW! Wow is the one to aim for."
        },
        author: {
            ar: "ميلتون جلاسر",
            en: "Milton Glaser"
        }
    },
    {
        quote: {
            ar: "الإبداع هو أن تسمح لنفسك بارتكاب الأخطاء. أما التصميم فهو معرفة أي من هذه الأخطاء يجب الاحتفاظ بها.",
            en: "Creativity is allowing yourself to make mistakes. Design is knowing which ones to keep."
        },
        author: {
            ar: "سكوت آدامز",
            en: "Scott Adams"
        }
    },
    {
        quote: {
            ar: "الشيء السحري في المنزل هو أن مغادرته شعور جيد، والعودة إليه شعور أفضل.",
            en: "The magic thing about home is that it feels good to leave, and it feels even better to come back."
        },
        author: {
            ar: "ويندي وندر",
            en: "Wendy Wunder"
        }
    },
    {
        quote: {
            ar: "يسافر الإنسان حول العالم بحثًا عما يحتاجه، ويعود إلى منزله ليجده.",
            en: "A man travels the world over in search of what he needs and returns home to find it."
        },
        author: {
            ar: "جورج أ. مور",
            en: "George A. Moore"
        }
    },
    {
        quote: {
            ar: "العمارة هي فن إهدار المساحة.",
            en: "Architecture is the art of how to waste space."
        },
        author: {
            ar: "فيليب جونسون",
            en: "Philip Johnson"
        }
    },
    {
        quote: {
            ar: "المنزل هو حيث يسكن الحب، وتُصنع الذكريات، وينتمي الأصدقاء دائمًا، والضحك لا ينتهي أبدًا.",
            en: "Home is where love resides, memories are created, friends always belong, and laughter never ends."
        },
        author: {
            ar: "مجهول",
            en: "Unknown"
        }
    },
    {
        quote: {
            ar: "يعرف المصمم أنه بلغ الكمال ليس عندما لا يتبقى شيء ليضيفه، بل عندما لا يتبقى شيء ليزيله.",
            en: "A designer knows he has achieved perfection not when there is nothing left to add, but when there is nothing left to take away."
        },
        author: {
            ar: "أنطوان دو سانت إكزوبيري",
            en: "Antoine de Saint-Exupéry"
        }
    },
    {
        quote: {
            ar: "جوهر العمارة هو الشكل والمساحة، والضوء هو العنصر الأساسي.",
            en: "The essence of architecture is form and space, and light is the essential element."
        },
        author: {
            ar: "آي. إم. باي",
            en: "I. M. Pei"
        }
    },
    {
        quote: {
            ar: "للإبداع، يجب على المرء أولاً أن يتساءل عن كل شيء.",
            en: "To create, one must first question everything."
        },
        author: {
            ar: "إيلين جراي",
            en: "Eileen Gray"
        }
    },
    {
        quote: {
            ar: "لا يمكن فقدان العقارات أو سرقتها، ولا يمكن نقلها. عند شرائها بحس سليم، ودفع ثمنها بالكامل، وإدارتها بعناية معقولة، فهي أكثر الاستثمارات أمانًا في العالم.",
            en: "Real estate cannot be lost or stolen, nor can it be carried away. Purchased with common sense, paid for in full, and managed with reasonable care, it is about the safest investment in the world."
        },
        author: {
            ar: "فرانكلين روزفلت",
            en: "Franklin D. Roosevelt"
        }
    },
    {
        quote: {
            ar: "المنزل هو حيث تبدأ قصتنا.",
            en: "Home is where our story begins."
        },
        author: {
            ar: "مجهول",
            en: "Unknown"
        }
    },
    {
        quote: {
            ar: "الشكل يتبع الوظيفة.",
            en: "Form follows function."
        },
        author: {
            ar: "لويس سوليفان",
            en: "Louis Sullivan"
        }
    },
    {
        quote: {
            ar: "الأقل هو الأكثر.",
            en: "Less is more."
        },
        author: {
            ar: "لودفيج ميس فان دير روه",
            en: "Ludwig Mies van der Rohe"
        }
    },
    {
        quote: {
            ar: "لم تدرك الشمس مدى عظمتها حتى أصابت جانب مبنى.",
            en: "The sun never knew how great it was until it hit the side of a building."
        },
        author: {
            ar: "لويس كان",
            en: "Louis Kahn"
        }
    },
    {
        quote: {
            ar: "يجب ألا تسمح الغرفة للعين بالاستقرار في مكان واحد. يجب أن تبتسم لك وتخلق الخيال.",
            en: "A room should not allow the eye to settle in one place. It should smile at you and create fantasy."
        },
        author: {
            ar: "خوان مونتويا",
            en: "Juan Montoya"
        }
    },
    {
        quote: {
            ar: "كل مهندس معماري عظيم هو - بالضرورة - شاعر عظيم. يجب أن يكون مترجمًا أصيلًا عظيمًا لزمنه ويومه وعصره.",
            en: "Every great architect is — necessarily — a great poet. He must be a great original interpreter of his time, his day, his age."
        },
        author: {
            ar: "فرانك لويد رايت",
            en: "Frank Lloyd Wright"
        }
    }
];

export let siteContentData: SiteContent = {
  logoUrl: '',
  locationPickerMapUrl: 'https://images.unsplash.com/photo-1589578228257-29283998b311?q=80&w=2070&auto=format&fit=crop',
  hero: {
    ar: {
      title: 'بوابتك الحصرية لأرقى العقارات في هليوبوليس الجديدة',
      subtitle: 'في ONLY HELIO، نختص بتقديم روائع معمارية وخدمات متكاملة مصممة خصيصًا لتلبية طموحات سكان مدينة هليوبوليس الجديدة.',
    },
    en: {
      title: 'Your Exclusive Gateway to the Finest Properties in New Heliopolis',
      subtitle: 'At ONLY HELIO, we specialize in delivering architectural masterpieces and integrated services tailored to meet the ambitions of New Heliopolis residents.',
    },
    images: [
        {
            src: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1600&auto=format&fit=crop",
            src_small: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=480&auto=format&fit=crop",
            src_medium: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800&auto=format&fit=crop",
            src_large: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1600&auto=format&fit=crop",
        },
        {
            src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1600&auto=format&fit=crop",
            src_small: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=480&auto=format&fit=crop",
            src_medium: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop",
            src_large: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1600&auto=format&fit=crop",
        },
        {
            src: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1600&auto=format&fit=crop",
            src_small: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=480&auto=format&fit=crop",
            src_medium: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop",
            src_large: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1600&auto=format&fit=crop",
        },
        {
            src: "https://images.unsplash.com/photo-1593696140826-c58b02198d47?q=80&w=1600&auto=format&fit=crop",
            src_small: "https://images.unsplash.com/photo-1593696140826-c58b02198d47?q=80&w=480&auto=format&fit=crop",
            src_medium: "https://images.unsplash.com/photo-1593696140826-c58b02198d47?q=80&w=800&auto=format&fit=crop",
            src_large: "https://images.unsplash.com/photo-1593696140826-c58b02198d47?q=80&w=1600&auto=format&fit=crop",
        }
    ],
    imageAlts: {
        ar: [
            "فيلا حديثة مع مسبح عند الغسق",
            "فيلا فاخرة بتصميم مستقبلي",
            "منزل عائلي أنيق بواجهة بيضاء",
            "مبنى سكني حديث بواجهات زجاجية"
        ],
        en: [
            "Modern villa with a pool at dusk",
            "Luxury villa with a futuristic design",
            "Elegant family house with a white facade",
            "Modern apartment building with glass facades"
        ]
    }
  },
  whyUs: {
    ar: {
      title: 'لماذا تختار منصة ONLY HELIO؟',
      description: 'نحن لا نعرض العقارات فقط، بل نبني منظومة متكاملة مبنية على الثقة والخبرة لخدمة كل المهتمين بمدينة هليوبوليس الجديدة.',
      features: [
        { title: 'سوق شامل ومتخصص', description: 'أكبر تجمع للعقارات والخدمات مخصص حصريًا لمدينة هليوبوليس الجديدة في مكان واحد.' },
        { title: 'تواصل مباشر وموثوق', description: 'نوفر لك قناة اتصال مباشرة مع نخبة من المطورين وشركات التشطيب الموثوقة.' },
        { title: 'منظومة متكاملة', description: 'كل ما تحتاجه لمنزلك، من البحث عن العقار وحتى التشطيب والديكور، تحت سقف واحد.' },
        { title: 'شفافية وجودة', description: 'نلتزم بعرض شركاء موثوقين فقط، مما يضمن لك تجربة آمنة وموثوقة لاتخاذ قراراتك.' }
      ]
    },
    en: {
      title: 'Why Choose the ONLY HELIO Platform?',
      description: 'We don\'t just list properties; we build an integrated ecosystem based on trust and expertise to serve everyone interested in New Heliopolis.',
      features: [
        { title: 'Comprehensive & Specialized Market', description: 'The largest collection of properties and services dedicated exclusively to New Heliopolis, all in one place.' },
        { title: 'Direct & Trusted Connection', description: 'We provide a direct communication channel with a selection of trusted developers and finishing companies.' },
        { title: 'Integrated Ecosystem', description: 'Everything you need for your new home, from property search to finishing and decoration, under one roof.' },
        { title: 'Transparency & Quality', description: 'We are committed to featuring only trusted partners, ensuring a safe and reliable experience for your decisions.' }
      ]
    }
  },
  services: {
    ar: {
      title: 'خدماتنا المتكاملة',
      description: 'نقدم حلولاً شاملة ومخصصة لمدينة هليوبوليس الجديدة، تلبي كافة احتياجاتكم العقارية من التصميم والديكور إلى التشطيبات والتسويق.',
      features: [
        { title: 'الخدمات العقارية', description: 'نوفر خدمات بيع وشراء وتأجير العقارات، مع إمكانية عرض عقارك مباشرة على منصتنا.', link: "/properties", icon: 'BuildingIcon' },
        { title: 'التشطيب والتصميم الداخلي', description: 'نقدم حلولاً متكاملة بدءًا من التصاميم والمقايسات الدقيقة، وصولاً للتنفيذ بأعلى جودة.', link: "/finishing", icon: 'FinishingIcon' },
        { title: 'الديكورات والتحف الفنية', description: 'نصمم وننفذ ديكورات جدارية ومنحوتات فنية، ونوفر لوحات وتحف فريدة لإضفاء لمسة جمالية.', link: "/decorations", icon: 'DecorationIcon' }
      ]
    },
    en: {
      title: 'Our Integrated Services',
      description: 'We provide comprehensive and customized solutions for New Heliopolis city, meeting all your real estate needs from design and decor to finishing and marketing.',
      features: [
        { title: 'Real Estate Services', description: 'We offer services for buying, selling, and renting properties, with the ability to list your property directly on our platform.', link: "/properties", icon: 'BuildingIcon' },
        { title: 'Finishing & Interior Design', description: 'We provide integrated solutions, from detailed designs and estimates to high-quality execution.', link: "/finishing", icon: 'FinishingIcon' },
        { title: 'Decorations & Antiques', description: 'We design and create wall decorations and sculptures, and provide unique paintings and antiques to add a touch of beauty.', link: "/decorations", icon: 'DecorationIcon' }
      ]
    }
  },
  partners: {
    ar: {
        title: 'شركاء العمل',
        description: 'نتعاون مع نخبة من المطورين والشركات لتقديم أفضل الخدمات في هليوبوليس الجديدة.',
        mega_projects_title: 'كبار المطورين',
        developers_title: 'مطورو المدينة',
        finishing_companies_title: 'شركات التشطيب والتصميم',
        agencies_title: 'المكاتب العقارية'
    },
    en: {
        title: 'Our Business Partners',
        description: 'We collaborate with a selection of top developers and companies to offer the best services in New Heliopolis.',
        mega_projects_title: 'Major Developers',
        developers_title: 'City Developers',
        finishing_companies_title: 'Finishing & Design Companies',
        agencies_title: 'Real Estate Agencies'
    }
  },
  whyNewHeliopolis: {
    ar: {
      title: 'لماذا هليوبوليس الجديدة؟',
      location: {
        title: 'مستقبل واعد وموقع استراتيجي فريد',
        description: 'هليوبوليس الجديدة ليست مجرد امتداد عمراني، بل هي رؤية لمستقبل الحياة العصرية في شرق القاهرة. بفضل موقعها الاستراتيجي على مقربة من المحاور الرئيسية، أصبحت المدينة نقطة انطلاق مثالية نحو العاصمة الإدارية، القاهرة الجديدة، ومدينة بدر، مع الحفاظ على هدوء وخصوصية مجتمعاتها السكنية.',
        stats: [
          { value: '15 دقيقة', desc: 'للعاصمة الإدارية' },
          { value: '20 دقيقة', desc: 'للقاهرة الجديدة' },
          { value: '10 دقائق', desc: 'لمدينتي والشروق' },
          { value: '30 دقيقة', desc: 'لمطار القاهرة الدولي' },
        ]
      }
    },
    en: {
      title: 'Why New Heliopolis?',
      location: {
        title: 'A Promising Future and a Unique Strategic Location',
        description: 'New Heliopolis is not just an urban extension; it is a vision for the future of modern living in East Cairo. Thanks to its strategic location near major axes, the city has become an ideal launchpad to the New Administrative Capital, New Cairo, and Badr City, while maintaining the tranquility and privacy of its residential communities.',
        stats: [
          { value: '15 mins', desc: 'to the New Capital' },
          { value: '20 mins', desc: 'to New Cairo' },
          { value: '10 mins', desc: 'to Madinaty & El Shorouk' },
          { value: '30 mins', desc: 'to Cairo International Airport' },
        ]
      }
    },
    images: [
        { src: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop", alt: "Map showing location of New Heliopolis" },
        { src: "https://images.unsplash.com/photo-1595995449553-15104a3b3f9?q=80&w=1200&auto=format&fit=crop", alt: "Gate of New Heliopolis" }
    ]
  },
  finishingServices: [
    {
      title: {
        ar: 'الاستشارة ووضع التصور',
        en: 'Consultation & Concept Design'
      },
      description: {
        ar: 'جلسات استشارية معمقة مع مهندسينا لفهم رؤيتك ومتطلباتك، نترجمها إلى تصورات مبدئية مبتكرة للتصميم الداخلي مع تقديم مقايسات تقديرية دقيقة للتكاليف وخيارات المواد.',
        en: 'In-depth consultation sessions with our engineers to understand your vision and requirements, translating them into innovative initial interior design concepts with accurate cost estimates and material options.'
      },
      pricingTiers: [
        {
          unitType: { ar: 'مكالمة استشارية أولية', en: 'Initial Consultation Call' },
          areaRange: { ar: 'جلسة أونلاين (60 دقيقة)', en: 'Online Session (60 min)' },
          price: 1500
        },
        {
          unitType: { ar: 'زيارة موقع واستشارة', en: 'On-site Visit & Consultation' },
          areaRange: { ar: 'جلسة في الموقع (3 ساعات)', en: 'On-site Session (3 hours)' },
          price: 4000
        },
        {
          unitType: { ar: 'ورشة عمل وتخطيط', en: 'Full Planning Workshop' },
          areaRange: { ar: 'يوم كامل (موقع/مكتب)', en: 'Full Day (Site/Office)' },
          price: 10000
        }
      ]
    },
    {
      title: {
        ar: 'التصميم ثلاثي الأبعاد',
        en: '3D Design & Visualization'
      },
      description: {
        ar: 'نحول التصور المبدئي إلى تصميم ثلاثي الأبعاد واقعي وتفاعلي، مما يسمح لك بالتجول افتراضيًا في منزلك المستقبلي وتعديل التفاصيل قبل البدء في أي أعمال تنفيذ.',
        en: 'We transform the initial concept into a realistic and interactive 3D design, allowing you to virtually walk through your future home and adjust details before any implementation work begins.'
      },
      pricingTiers: [
        {
          unitType: { ar: 'شقة', en: 'Apartment' },
          areaRange: { ar: 'حتى 150 م²', en: 'Up to 150m²' },
          price: 15000
        },
        {
          unitType: { ar: 'شقة', en: 'Apartment' },
          areaRange: { ar: '151 - 250 م²', en: '151m² - 250m²' },
          price: 20000
        },
        {
          unitType: { ar: 'فيلا', en: 'Villa' },
          areaRange: { ar: 'حتى 300 م²', en: 'Up to 300m²' },
          price: 30000
        },
        {
          unitType: { ar: 'فيلا', en: 'Villa' },
          areaRange: { ar: 'أكثر من 300 م²', en: 'Above 300m²' },
          price: 45000
        }
      ]
    }
  ],
  quotes: quotesData,
  footer: {
    ar: {
      description: 'وجهتكم الأولى لاستكشاف أرقى العقارات والخدمات المتكاملة في قلب هليوبوليس الجديدة. نحن نصنع روائع معمارية تلبي طموحاتكم.',
      address: 'هليوبوليس الجديدة, القاهرة, مصر',
      hours: 'الأحد - الخميس: 9 صباحًا - 6 مساءً',
    },
    en: {
      description: 'Your premier destination for exploring the finest properties and integrated services in the heart of New Heliopolis. We create architectural masterpieces that meet your ambitions.',
      address: 'New Heliopolis, Cairo, Egypt',
      hours: 'Sunday - Thursday: 9 AM - 6 PM',
    },
    phone: '+20 123 456 7890',
    email: 'info@onlyhelio.com',
    social: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#'
    }
  }
};