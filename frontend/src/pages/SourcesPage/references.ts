/**
 * @fileoverview Research bibliography for the Sources page — AMA (11th ed.) style, linked.
 *
 * The 43-source research corpus (generated from the repository's research/ bibliography)
 * plus the project's background essay sources, grouped into site-friendly categories.
 * Within a category, references follow the corpus source-ID order.
 *
 * Generated file — regenerate with ~/.cache/bba-cite/gen_refs.py after the corpus changes.
 */

export interface Reference {
  citation: string;
  url: string;
}

export interface ReferenceCategory {
  title: string;
  items: Reference[];
}

export const RESEARCH_REFERENCES: ReferenceCategory[] = [
  {
    title: 'Recommender Systems & Machine Learning',
    items: [
      {
        citation:
          'Covington P, Adams J, Sargin E. Deep neural networks for YouTube recommendations. In: Proceedings of the 10th ACM Conference on Recommender Systems (RecSys ’16). Association for Computing Machinery; 2016:191-198. doi:10.1145/2959100.2959190',
        url: 'https://doi.org/10.1145/2959100.2959190',
      },
      {
        citation:
          'Zou L, Xia L, Ding Z, Song J, Liu W, Yin D. Reinforcement learning to optimize long-term user engagement in recommender systems. In: Proceedings of the 25th ACM SIGKDD International Conference on Knowledge Discovery & Data Mining (KDD ’19). Association for Computing Machinery; 2019:2810-2818. doi:10.1145/3292500.3330668',
        url: 'https://doi.org/10.1145/3292500.3330668',
      },
      {
        citation:
          'Koren Y, Bell R, Volinsky C. Matrix factorization techniques for recommender systems. Computer. 2009;42(8):30-37. doi:10.1109/MC.2009.263',
        url: 'https://doi.org/10.1109/MC.2009.263',
      },
      {
        citation:
          'Ovadya A. Bridging-Based Ranking. Belfer Center for Science and International Affairs, Harvard Kennedy School; 2022. Accessed May 31, 2026. https://www.belfercenter.org/publication/bridging-based-ranking',
        url: 'https://www.belfercenter.org/publication/bridging-based-ranking',
      },
      {
        citation:
          'McMahan HB, Moore E, Ramage D, Hampson S, Agüera y Arcas B. Communication-efficient learning of deep networks from decentralized data. In: Proceedings of the 20th International Conference on Artificial Intelligence and Statistics (AISTATS). Vol 54. PMLR; 2017:1273-1282.',
        url: '',
      },
      {
        citation:
          'Huszár F, Ktena SI, O’Brien C, Belli L, Schlaikjer A, Hardt M. Algorithmic amplification of politics on Twitter. Proc Natl Acad Sci U S A. 2022;119(1):e2025334119. doi:10.1073/pnas.2025334119',
        url: 'https://doi.org/10.1073/pnas.2025334119',
      },
      {
        citation:
          'Naumov M, Mudigere D, Shi HJM, et al. Deep learning recommendation model for personalization and recommendation systems. Preprint. Posted online 2019. arXiv. doi:10.48550/arXiv.1906.00091',
        url: 'https://doi.org/10.48550/arXiv.1906.00091',
      },
      {
        citation:
          'Cheng HT, Koc L, Harmsen J, et al. Wide & deep learning for recommender systems. In: Proceedings of the 1st Workshop on Deep Learning for Recommender Systems (DLRS 2016). Association for Computing Machinery; 2016:7-10. doi:10.1145/2988450.2988454',
        url: 'https://doi.org/10.1145/2988450.2988454',
      },
      {
        citation:
          'Li L, Chu W, Langford J, Schapire RE. A contextual-bandit approach to personalized news article recommendation. In: Proceedings of the 19th International Conference on World Wide Web (WWW ’10). Association for Computing Machinery; 2010:661-670. doi:10.1145/1772690.1772758',
        url: 'https://doi.org/10.1145/1772690.1772758',
      },
      {
        citation:
          'Chaney AJB, Stewart BM, Engelhardt BE. How algorithmic confounding in recommendation systems increases homogeneity and decreases utility. In: Proceedings of the 12th ACM Conference on Recommender Systems (RecSys ’18). Association for Computing Machinery; 2018:224-232. doi:10.1145/3240323.3240370',
        url: 'https://doi.org/10.1145/3240323.3240370',
      },
      {
        citation:
          'Jiang R, Chiappa S, Lattimore T, György A, Kohli P. Degenerate feedback loops in recommender systems. In: Proceedings of the 2019 AAAI/ACM Conference on AI, Ethics, and Society (AIES ’19). Association for Computing Machinery; 2019:383-390. doi:10.1145/3306618.3314288',
        url: 'https://doi.org/10.1145/3306618.3314288',
      },
    ],
  },
  {
    title: 'Data, Privacy & Inference',
    items: [
      {
        citation:
          'Kosinski M, Stillwell D, Graepel T. Private traits and attributes are predictable from digital records of human behavior. Proc Natl Acad Sci U S A. 2013;110(15):5802-5805. doi:10.1073/pnas.1218772110',
        url: 'https://doi.org/10.1073/pnas.1218772110',
      },
      {
        citation:
          'De Choudhury M, Gamon M, Counts S, Horvitz E. Predicting depression via social media. Proc Int AAAI Conf Web Soc Media. 2013;7(1):128-137. doi:10.1609/icwsm.v7i1.14432',
        url: 'https://doi.org/10.1609/icwsm.v7i1.14432',
      },
      {
        citation:
          'Eichstaedt JC, Smith RJ, Merchant RM, et al. Facebook language predicts depression in medical records. Proc Natl Acad Sci U S A. 2018;115(44):11203-11208. doi:10.1073/pnas.1802331115',
        url: 'https://doi.org/10.1073/pnas.1802331115',
      },
      {
        citation:
          'Federal Trade Commission. Data Brokers: A Call for Transparency and Accountability. Federal Trade Commission; 2014. Accessed May 31, 2026. https://www.ftc.gov/system/files/documents/reports/data-brokers-call-transparency-accountability-report-federal-trade-commission-may-2014/140527databrokerreport.pdf',
        url: 'https://www.ftc.gov/system/files/documents/reports/data-brokers-call-transparency-accountability-report-federal-trade-commission-may-2014/140527databrokerreport.pdf',
      },
      {
        citation:
          'Information Commissioner’s Office. Investigation Into the Use of Data Analytics in Political Campaigns: A Report to Parliament. Information Commissioner’s Office; 2018. Accessed May 31, 2026. https://ico.org.uk/media2/migrated/2260271/investigation-into-the-use-of-data-analytics-in-political-campaigns-final-20181105.pdf',
        url: 'https://ico.org.uk/media2/migrated/2260271/investigation-into-the-use-of-data-analytics-in-political-campaigns-final-20181105.pdf',
      },
      {
        citation:
          'Zuboff S. Big other: surveillance capitalism and the prospects of an information civilization. J Inf Technol. 2015;30(1):75-89. doi:10.1057/jit.2015.5',
        url: 'https://doi.org/10.1057/jit.2015.5',
      },
    ],
  },
  {
    title: 'Psychology, Neuroscience & Mental Health',
    items: [
      {
        citation:
          'Orben A, Przybylski AK. The association between adolescent well-being and digital technology use. Nat Hum Behav. 2019;3(2):173-182. doi:10.1038/s41562-018-0506-1',
        url: 'https://doi.org/10.1038/s41562-018-0506-1',
      },
      {
        citation:
          'Braghieri L, Levy R, Makarin A. Social media and mental health. Am Econ Rev. 2022;112(11):3660-3693. doi:10.1257/aer.20211218',
        url: 'https://doi.org/10.1257/aer.20211218',
      },
      {
        citation:
          'Fardouly J, Vartanian LR. Social media and body image concerns: current research and future directions. Curr Opin Psychol. 2016;9:1-5. doi:10.1016/j.copsyc.2015.09.005',
        url: 'https://doi.org/10.1016/j.copsyc.2015.09.005',
      },
      {
        citation:
          'Allcott H, Braghieri L, Eichmeyer S, Gentzkow M. The welfare effects of social media. Am Econ Rev. 2020;110(3):629-676. doi:10.1257/aer.20190658',
        url: 'https://doi.org/10.1257/aer.20190658',
      },
      {
        citation:
          'Lindström B, Bellander M, Schultner DT, Chang A, Tobler PN, Amodio DM. A computational reward learning account of social media engagement. Nat Commun. 2021;12(1):1311. doi:10.1038/s41467-020-19607-x',
        url: 'https://doi.org/10.1038/s41467-020-19607-x',
      },
      {
        citation:
          'Sherman LE, Payton AA, Hernandez LM, Greenfield PM, Dapretto M. The power of the like in adolescence: effects of peer influence on neural and behavioral responses to social media. Psychol Sci. 2016;27(7):1027-1035. doi:10.1177/0956797616645673',
        url: 'https://doi.org/10.1177/0956797616645673',
      },
      {
        citation:
          'Meshi D, Tamir DI, Heekeren HR. The emerging neuroscience of social media. Trends Cogn Sci. 2015;19(12):771-782. doi:10.1016/j.tics.2015.09.004',
        url: 'https://doi.org/10.1016/j.tics.2015.09.004',
      },
      {
        citation:
          'Kross E, Verduyn P, Demiralp E, et al. Facebook use predicts declines in subjective well-being in young adults. PLoS One. 2013;8(8):e69841. doi:10.1371/journal.pone.0069841',
        url: 'https://doi.org/10.1371/journal.pone.0069841',
      },
    ],
  },
  {
    title: 'Youth, Body Image & Public Health',
    items: [
      {
        citation:
          'Wells G, Horwitz J, Seetharaman D. Facebook knows Instagram is toxic for teen girls, company documents show. The Wall Street Journal. September 14, 2021. Accessed May 31, 2026. https://www.wsj.com/articles/facebook-knows-instagram-is-toxic-for-teen-girls-company-documents-show-11631620739',
        url: 'https://www.wsj.com/articles/facebook-knows-instagram-is-toxic-for-teen-girls-company-documents-show-11631620739',
      },
      {
        citation:
          'Rajanala S, Maymone MBC, Vashi NA. Selfies—living in the era of filtered photographs. JAMA Facial Plast Surg. 2018;20(6):443-444. doi:10.1001/jamafacial.2018.0486',
        url: 'https://doi.org/10.1001/jamafacial.2018.0486',
      },
      {
        citation:
          'U.K. coroner finds “negative effect” of Instagram, Pinterest content contributed to teen Molly Russell’s suicide death. CBS News. October 3, 2022. Accessed May 31, 2026. https://www.cbsnews.com/news/molly-russell-suicide-death-coroner-social-media-instagram-pinterest/ (Inquest conclusion of Senior Coroner Andrew Walker, North London Coroner’s Court, September 30, 2022.)',
        url: 'https://www.cbsnews.com/news/molly-russell-suicide-death-coroner-social-media-instagram-pinterest/',
      },
      {
        citation:
          'Center for Countering Digital Hate. Deadly by Design: TikTok Pushes Harmful Content Promoting Eating Disorders and Self-Harm Into Users’ Feeds. Center for Countering Digital Hate; 2022. Accessed May 31, 2026. https://counterhate.com/research/deadly-by-design/',
        url: 'https://counterhate.com/research/deadly-by-design/',
      },
      {
        citation:
          'Office of the Surgeon General. Social Media and Youth Mental Health: The U.S. Surgeon General’s Advisory. US Department of Health and Human Services; 2023. Accessed May 31, 2026. https://www.hhs.gov/sites/default/files/sg-youth-mental-health-social-media-advisory.pdf',
        url: 'https://www.hhs.gov/sites/default/files/sg-youth-mental-health-social-media-advisory.pdf',
      },
      {
        citation:
          'American Psychological Association. Health Advisory on Social Media Use in Adolescence. American Psychological Association; 2023. Accessed May 31, 2026. https://www.apa.org/topics/social-media-internet/health-advisory-adolescent-social-media-use',
        url: 'https://www.apa.org/topics/social-media-internet/health-advisory-adolescent-social-media-use',
      },
      {
        citation:
          'Strubel J, Petrie TA. Love me Tinder: body image and psychosocial functioning among men and women. Body Image. 2017;21:34-38. doi:10.1016/j.bodyim.2017.02.006',
        url: 'https://doi.org/10.1016/j.bodyim.2017.02.006',
      },
      {
        citation:
          "Regehr K, Shaughnessy C, Zhao M, Cambazoglu I, Turner A, Shaughnessy N. Normalizing toxicity: the role of recommender algorithms for young people's mental health and social wellbeing. Front Psychol. 2025;16:1523649. doi:10.3389/fpsyg.2025.1523649",
        url: 'https://doi.org/10.3389/fpsyg.2025.1523649',
      },
      {
        citation:
          'Lenhart A, Green A. A Double-Edged Sword: How Diverse Communities of Young People Think About the Multifaceted Relationship Between Social Media and Mental Health. Common Sense Media; Hopelab; 2024. Accessed June 5, 2026. https://www.commonsensemedia.org/research/double-edged-sword-how-diverse-communities-of-young-people-think-about-social-media-and-mental-health',
        url: 'https://www.commonsensemedia.org/research/double-edged-sword-how-diverse-communities-of-young-people-think-about-social-media-and-mental-health',
      },
      {
        citation:
          'American Academy of Sleep Medicine. Americans are “doomscrolling” at bedtime, prioritizing screen time over sleep. 2025 AASM Sleep Prioritization Survey. February 23, 2026. Accessed June 5, 2026. https://aasm.org/americans-are-doomscrolling-at-bedtime-prioritizing-screen-time-over-sleep/',
        url: 'https://aasm.org/americans-are-doomscrolling-at-bedtime-prioritizing-screen-time-over-sleep/',
      },
      {
        citation:
          'American Academy of Pediatrics. Center of Excellence on Social Media and Youth Mental Health. American Academy of Pediatrics; 2023. Accessed June 5, 2026. https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/',
        url: 'https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/',
      },
    ],
  },
  {
    title: 'Ethics, Law & Policy',
    items: [
      {
        citation:
          'Theodos K, Sittig S. Health information privacy laws in the digital age: HIPAA doesn’t apply. Perspect Health Inf Manag. 2021;18(Winter):1l. Accessed May 31, 2026. https://pmc.ncbi.nlm.nih.gov/articles/PMC7883355/',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7883355/',
      },
      {
        citation:
          'Federal Trade Commission. FTC enforcement action to bar GoodRx from sharing consumers’ sensitive health info for advertising. February 1, 2023. Accessed May 31, 2026. https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising (See also: In re BetterHelp, Inc, FTC Matter No. 2023169; March 2, 2023.)',
        url: 'https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising',
      },
      {
        citation:
          'Stray J. Aligning AI optimization to community well-being. Int J Community Wellbeing. 2020;3(4):443-463. doi:10.1007/s42413-020-00086-3',
        url: 'https://doi.org/10.1007/s42413-020-00086-3',
      },
      {
        citation:
          'Friedman B, Kahn PH Jr, Borning A. Value sensitive design and information systems. In: Zhang P, Galletta D, eds. Human-Computer Interaction and Management Information Systems: Foundations. M.E. Sharpe; 2006:348-372. (Reprinted in: Himma KE, Tavani HT, eds. The Handbook of Information and Computer Ethics. Wiley; 2008. doi:10.1002/9780470281819.ch4)',
        url: 'https://doi.org/10.1002/9780470281819.ch4',
      },
      {
        citation:
          'Regulation (EU) 2022/2065 of the European Parliament and of the Council of 19 October 2022 on a Single Market for Digital Services (Digital Services Act). Off J Eur Union. 2022;L277:1-102. Accessed May 31, 2026. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2065',
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2065',
      },
      {
        citation:
          'Bhargava VR, Velasquez M. Ethics of the attention economy: the problem of social media addiction. Bus Ethics Q. 2021;31(3):321-359. doi:10.1017/beq.2020.32',
        url: 'https://doi.org/10.1017/beq.2020.32',
      },
      {
        citation:
          'Rathje S, Van Bavel JJ, van der Linden S. Out-group animosity drives engagement on social media. Proc Natl Acad Sci U S A. 2021;118(26):e2024292118. doi:10.1073/pnas.2024292118',
        url: 'https://doi.org/10.1073/pnas.2024292118',
      },
    ],
  },
  {
    title: 'Background & Essay Sources',
    items: [
      {
        citation:
          "Qiu T. A psychiatrist's perspective on social media algorithms and mental health. Stanford Institute for Human-Centered Artificial Intelligence (HAI). 2021.",
        url: 'https://hai.stanford.edu/news/psychiatrists-perspective-social-media-algorithms-and-mental-health',
      },
      {
        citation:
          'Adam D. Machines can spot mental health issues—if you hand over your personal data. MIT Technology Review. August 13, 2020.',
        url: 'https://www.technologyreview.com/2020/08/13/1006573/digital-psychiatry-phenotyping-schizophrenia-bipolar-privacy/',
      },
      {
        citation:
          'Murdoch B. Privacy and artificial intelligence: challenges for protecting health information in a new era. BMC Med Ethics. 2021;22:122.',
        url: 'https://doi.org/10.1186/s12910-021-00687-3',
      },
      {
        citation:
          'Felzmann H, Kennedy R. Algorithms, social media and mental health. Society for Computers and Law (SCL). 2016.',
        url: 'https://www.scl.org/articles/3746-algorithms-social-media-and-mental-health',
      },
      {
        citation:
          'Jones RB, et al. A digital intervention for adolescent depression (MoodHwb): mixed methods feasibility evaluation. JMIR Ment Health. 2020;7(7):e14536.',
        url: 'https://mental.jmir.org/2020/7/e14536',
      },
      {
        citation: 'Uprise Health. Ethical and data privacy concerns for mental health apps. 2022.',
        url: 'https://uprisehealth.com/resources/health-data-privacy-mental-health-app/',
      },
    ],
  },
];
