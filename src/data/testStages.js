const RW_QUESTIONS = [
  {
    prompt:
      "Which choice completes the text with the most logical and precise word or phrase?",
    stem: "Although critics believed that customers would never agree to pay to pick their own produce on farms, such concerns didn’t ______blank Booker T. Whatley’s efforts to promote the practice. Thanks in part to Whatley’s determined advocacy, farms that allow visitors to pick their own apples, pumpkins, and other produce can be found throughout the United States.",
    choices: ["enhance", "hinder", "misrepresent", "aggravate"],
  },
  {
    prompt:
      "Which choice completes the text with the most logical and precise word or phrase?",
    stem: "The artisans of the Igun Eronmwon guild in Benin City, Nigeria, typically ______blank the bronze- and brass-casting techniques that have been passed down through their families since the thirteenth century, but they don’t strictly observe every tradition; for example, guild members now use air-conditioning motors instead of handheld bellows to help heat their forges.",
    choices: ["experiment with", "adhere to", "improve on", "grapple with"],
  },
  {
    prompt:
      "Which choice completes the text with the most logical and precise word or phrase?",
    stem: "Set in a world where science fiction tropes exist as everyday realities, Charles Yu’s 2010 novel How to Live Safely in a Science Fictional Universe traces a time traveler’s quest to find his father. Because the journey at the novel’s center is so ______blank, with the protagonist ricocheting chaotically across time, the reader often wonders whether the pair will ever be reunited.",
    choices: ["haphazard", "premeditated", "inspirational", "fruitless"],
  },
  {
    prompt:
      "Which choice completes the text with the most logical and precise word or phrase?",
    stem: "In a 2019 study, Jeremy Gunawardena and colleagues found that the single-celled protozoan Stentor roeseli not only uses strategies to escape irritating stimuli but also switches strategies when one fails. This evidence of protozoans sophisticatedly “changing their minds” demonstrates that single-celled organisms may not be limited to ______blank behaviors.",
    choices: ["aggressive", "rudimentary", "evolving", "advantageous"],
  },
  {
    prompt:
      "Which choice completes the text with the most logical and precise word or phrase?",
    stem: "Some economic historians ______blank that late nineteenth- and early twentieth-century households in the United States experienced an economy of scale when it came to food purchases—they assumed that large households spent less on food per person than did small households. Economist Trevon Logan showed, however, that a close look at the available data disproves this supposition.",
    choices: ["surmised", "contrived", "questioned", "regretted"],
  },
  {
    prompt:
      "As used in the text, what does the word “answers” most nearly mean?",
    stem: "The following text is adapted from Karel Čapek’s 1920 play R.U.R. ...\n\nFABRY: One Robot can replace two and a half workmen. The human machine, Miss Glory, was terribly imperfect. It had to be removed sooner or later.\n\nBUSMAN: It was too expensive.\n\nFABRY: It was not effective. It no longer answers the requirements of modern engineering. Nature has no idea of keeping pace with modern labor.",
    choices: ["Explains", "Rebuts", "Defends", "Fulfills"],
  },
  {
    prompt:
      "According to the text, why would a helicopter built for Earth be unable to fly on Mars?",
    stem: "In 2014, Amelia Quon and her team at NASA set out to build a helicopter capable of flying on Mars. Because Mars’s atmosphere is only one percent as dense as Earth’s, the air of Mars would not provide enough resistance to the rotating blades of a standard helicopter for the aircraft to stay aloft. For five years, Quon’s team tested designs in a lab that mimicked Mars’s atmospheric conditions. The craft the team ultimately designed can fly on Mars because its blades are longer and rotate faster than those of a helicopter of the same size built for Earth.",
    choices: [
      "Because Mars and Earth have different atmospheric conditions",
      "Because the blades of helicopters built for Earth are too large to work on Mars",
      "Because the gravity of Mars is much weaker than the gravity of Earth",
      "Because helicopters built for Earth are too small to handle the conditions on Mars",
    ],
  },
  {
    prompt: "Which choice best states the main idea of the text?",
    stem: "In West Africa, jalis have traditionally been keepers of information about family histories and records of important events. They have often served as teachers and advisers, too. New technologies may have changed some aspects of the role today, but jalis continue to be valued for knowing and protecting their peoples’ stories.",
    choices: [
      "Even though there have been some changes in their role, jalis continue to preserve their communities’ histories.",
      "Although jalis have many roles, many of them like teaching best.",
      "Jalis have been entertaining the people within their communities for centuries.",
      "Technology can now do some of the things jalis used to be responsible for.",
    ],
  },
  {
    prompt: "Which choice best states the main idea of the text?",
    stem: "The following text is adapted from Jack London’s The Call of the Wild...\nThornton alone held [Buck]... Buck refused to notice them till he learned they were close to Thornton; after that he tolerated them...",
    choices: [
      "Buck has become less social since he began living with Thornton.",
      "Buck mistrusts humans and does his best to avoid them.",
      "Buck has been especially well liked by most of Thornton’s friends.",
      "Buck holds Thornton in higher regard than any other person.",
    ],
  },
  {
    prompt:
      "“Which quotation from the poem most effectively illustrates the claim?",
    stem: "Lines Written in Early Spring” is a 1798 poem by William Wordsworth. In the poem, the speaker describes having contradictory feelings while experiencing the sights and sounds of a spring day: ______\n",
    choices: [
      "“Through primrose-tufts... every flower / Enjoys the air it breathes.”",
      "“The budding twigs spread out their fan... That there was pleasure there.”",
      "“The birds around me hopp’d and play’d... It seem’d a thrill of pleasure.”",
      "“I heard a thousand blended notes... pleasant thoughts / Bring sad thoughts to the mind.”",
    ],
  },
  {
    prompt: "Which choice most logically completes the text?",
    stem: "The Souls of Black Folk is a 1903 book by W.E.B. Du Bois... Zelda authored several works... Thus, those who primarily view Zelda as an inspiration for F. Scott’s writings ______\n",
    choices: [
      "overlook the many other factors that motivated F. Scott to write.",
      "risk misrepresenting the full range of Zelda’s contributions to literature.",
      "may draw inaccurate conclusions about how F. Scott and Zelda viewed each other’s works.",
      "tend to read the works of F. Scott and Zelda in an overly autobiographical light.",
    ],
  },
  {
    prompt: "Which choice most logically completes the text?",
    stem: "Herbivorous sauropod dinosaurs could grow more than 100 feet long and weigh up to 80 tons... however, there is no evidence of significant spikes in carbon dioxide coinciding with relevant periods in sauropod evolution, suggesting that ______",
    choices: [
      "fluctuations in atmospheric carbon dioxide affected different sauropod lineages differently.",
      "the evolution of larger body sizes in sauropods did not depend on increased atmospheric carbon dioxide.",
      "atmospheric carbon dioxide was higher when the largest known sauropods lived than it was when the first sauropods appeared.",
      "sauropods probably would not have evolved to such immense sizes if atmospheric carbon dioxide had been even slightly higher.",
    ],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "Known for her massive photorealistic paintings of African American figures floating or swimming in pools, Calida Garcia ______blank was the logical choice to design the book cover for Ta-Nehisi Coates’s The Water Dancer, a novel about an African American man who can travel great distances through water.",
    choices: ["Rawles—", "Rawles:", "Rawles,", "Rawles"],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "In 2010, archaeologist Noel Hidalgo Tan was visiting the twelfth-century temple of Angkor Wat in Cambodia when he noticed markings of red paint on the temple ______blank the help of digital imaging techniques, he discovered the markings to be part of an elaborate mural containing over 200 paintings.",
    choices: ["walls, with", "walls with", "walls so with", "walls. With"],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "Cheng Dang and her colleagues at the University of Washington recently ran simulations to determine the extent to which individual snow ______blank affect the amount of light reflecting off a snowy surface.",
    choices: [
      "grain’s physical properties’",
      "grains’ physical properties",
      "grains’ physical property’s",
      "grains physical properties",
    ],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "The Mission 66 initiative, which was approved by Congress in 1956, represented a major investment in the infrastructure of overburdened national ______blank it prioritized physical improvements to the parks’ roads, utilities, employee housing, and visitor facilities while also establishing educational programming for the public.",
    choices: ["parks and", "parks", "parks;", "parks,"],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "The Progressive Era in the United States witnessed the rise of numerous Black women’s clubs, local organizations that advocated for racial and gender equality. Among the clubs’ leaders ______blank Josephine St. Pierre Ruffin, founder of the Women’s Era Club of Boston.",
    choices: ["was", "were", "are", "have been"],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "Eli Eisenberg, a genetics expert at Tel Aviv University in Israel, recently discovered that ______blank have a special genetic ability called RNA editing that confers evolutionary advantages.",
    choices: [
      "cephalopods, ocean dwellers that include the squid, the octopus, and the cuttlefish",
      "cephalopods—ocean dwellers—that include the squid, the octopus, and the cuttlefish,",
      "cephalopods, ocean dwellers that include: the squid, the octopus, and the cuttlefish,",
      "cephalopods—ocean dwellers that include the squid, the octopus, and the cuttlefish—",
    ],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "A model created by biologist Luis Valente predicts that the rate of speciation—the rate at which new species form—on an isolated island located approximately 5,000 kilometers from the nearest mainland ______blank triple the rate of speciation on an island only 500 kilometers from the mainland.",
    choices: ["being", "to be", "to have been", "will be"],
  },
  {
    prompt: "Which choice completes the text with the most logical transition?",
    stem: "Award-winning travel writer Linda Watanabe McFerrin considers the background research she conducts on destinations featured in her travel books to be its own reward. ______blank McFerrin admits to finding the research phase of her work just as fascinating and engaging as exploring a location in person.",
    choices: ["By contrast,", "Likewise,", "Besides,", "In fact,"],
  },
  {
    prompt:
      "TWhich choice completes the text with the most logical transition?",
    stem: "A firefly uses specialized muscles to draw oxygen into its lower abdomen through narrow tubes, triggering a chemical reaction whereby the oxygen combines with chemicals in the firefly’s abdomen to produce a glow. ______blank when the firefly stops drawing in oxygen, the reaction—and the glow—cease.",
    choices: [
      "For instance,",
      "By contrast,",
      "Specifically,",
      "In conclusion,",
    ],
  },
  {
    prompt:
      "The student wants to emphasize the distance covered by the Philadelphia and Lancaster Turnpike. Which choice uses information from the notes to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: The Philadelphia and Lancaster Turnpike was a road built between 1792 and 1794; It was the first private turnpike in the United States; It was sixty-two miles long.",
    choices: [
      "The 62 mile-long Philadelphia and Lancaster Turnpike connected cities of Philadelphia and Lancaster.",
      "The Philadelphia and Lancaster Turnpike was the first private turnpike in the United States.",
      "The Philadelphia and Lancaster Turnpike, which connected two cities, was built between 1792 and 1794.",
      "A historic Pennsylvania road, the Philadelphia and Lancaster Turnpike was completed in 1794.",
    ],
  },
  {
    prompt:
      "The student wants to emphasize the mass of Sirius A. Which choice effectively uses information from the notes to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: In astronomy, the mass of stars can be described in units called solar masses; The mass of the star Proxima Centauri is 0.122 solar masses; The mass of the star Sirius A is 2.063 solar masses; One solar mass is roughly equal to the mass of the Sun.",
    choices: [
      "The mass of stars, like Proxima Centauri, can be described in units called solar masses.",
      "In astronomy, the mass of stars can be described in units called solar masses, and one solar mass is roughly equal to the mass of the Sun.",
      "The Sun is more massive than Proxima Centauri, which has a mass of 0.122 solar masses.",
      "With a mass of 2.063 solar masses, Sirius A is more massive than the Sun.",
    ],
  },
  {
    prompt:
      "The student wants to emphasize a similarity between the two species. Which choice most effectively uses information to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: 7 sea turtle species; 5 in Atlantic; Kemp’s ridley (Lepidochelys kempii); olive ridley (Lepidochelys olivacea).",
    choices: [
      "Among the seven species of sea turtle is the olive ridley sea turtle, which can be found in the Atlantic Ocean.",
      "The Kemp’s ridley turtle is referred to as Lepidochelys kempii, while the olive ridley turtle is referred to as Lepidochelys olivacea.",
      "Both the Kemp’s ridley  turtle and the olive ridley turtle can be found in the Atlantic Ocean.",
      "The Kemp’s ridley turtle and the olive ridley turtle are different species.",
    ],
  },
  {
    prompt:
      "The student wants to identify what type of scientist Chaudhuri is. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: Angana Chaudhuri is a scientist.; Chaudhuri studies sedimentary rocks ; A scientist who studies sedimentary rocks is called a sedimentologist; Shale, chalk, and sandstone are examples of sedimentary rocks. ",
    choices: [
      "Chalk is a type of sedimentary rock.",
      "Some scientists study shale, chalk, and sandstone.",
      "There are scientists who study sedimentary rocks.",
      "Chaudhuri is a sedimentologist.",
    ],
  },
  {
    prompt:
      "The student wants to indicate the year Yosemite Falls was completed.  Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: Chiura Obata was a Japanese American artist who lived in California; Yosemite Falls is a notable painting by Obata. ; It uses a Japanese method of black ink painting called sumi-e.; This painting was completed in 1930.",
    choices: [
      "While living in California, Obata created black ink paintings.",
      "Obata, a Japanese American artist, created a notable painting.",
      "Yosemite Falls was completed in 1930.",
      "Obata used a Japanese painting method called sumi-e.",
    ],
  },
  {
    prompt:
      "The student wants to emphasize a similarity between P waves and S waves. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: Earthquakes start at a focus → seismic waves. Two subsurface wave types: P and S. P faster; P compress/expand ground; S move side to side.",
    choices: [
      "P waves and S waves both travel beneath Earth’s surface, causing the ground to move.",
      "P waves travel away from an earthquake’s starting point at a higher rate of speed than do S waves.",
      "Spreading out from the focus of an earthquake, P waves move the ground backward and forward.",
      "Although P waves and S waves start at the same point, they behave very differently.",
    ],
  },
];
const RW_QUESTIONS_2 = [
  {
    prompt:
      "Which choice completes the text with the most logical and precise word or phrase?",
    stem: "Critics have asserted that fine art and fashion rarely ______blank in a world where artists create timeless works for exhibition and designers periodically produce new styles for the public to buy. Luiseño/Shoshone-Bannock beadwork artist and designer Jamie Okuma challenges this view: her work can be seen in the Metropolitan Museum of Art and purchased through her online boutique.",
    choices: ["prevail", "succumb", "diverge", "intersect"],
  },
  {
    prompt:
      "Which choice completes the text with the most logical and precise word or phrase?",
    stem: "Barring major archaeological discoveries, we are unlikely to ever have ______blank account of ancient Egypt under the female pharaoh Hatshepsut, as much of the evidence of her reign was deliberately destroyed by her successors.",
    choices: [
      "an imaginative",
      "a superficial",
      "an exhaustive",
      "a questionable",
    ],
  },
  {
    prompt:
      "Which choice completes the text with the most logical and precise word or phrase?",
    stem: "The work of Kiowa painter T.C. Cannon derives its power in part from the tension among his ______blank influences: classic European portraiture, with its realistic treatment of faces; the American pop art movement, with its vivid colors; and flatstyle, the intertribal painting style that rejects the effect of depth typically achieved through shading and perspective.",
    choices: ["complementary", "unknown", "disparate", "interchangeable"],
  },
  {
    prompt:
      "Which choice completes the text with the most logical and precise word or phrase?",
    stem: "Proposals to raise the age at which retirees begin receiving government transfers of funds are generally discussed in terms of the effects on transfer recipients, but Andria Smythe has argued that delaying such transfers could ______blank wealth creation among working adults by lengthening the period in which they are providing financial support to their nonworking parents.",
    choices: ["stymie", "compound", "disparage", "outstrip"],
  },
  {
    prompt: "Which choice best describes the overall structure of the text?",
    stem: "The following text is adapted from Aphra Behn’s 1689 novel The Lucky Mistake. Atlante and Rinaldo are neighbors who have been secretly exchanging letters through Charlot, Atlante’s sister. [Atlante] gave this letter to Charlot; who immediately ran into the balcony with it, where she still found Rinaldo in a melancholy posture, leaning his head on his hand: She showed him the letter, but was afraid to toss it to him, for fear it might fall to the ground; so he ran and fetched a long cane, which he cleft at one end, and held it while she put the letter into the cleft, and stayed not to hear what he said to it. But never was man so transported with joy, as he was at the reading of this letter; it gives him new wounds; for to the generous, nothing obliges love so much as love.",
    choices: [
      "It describes the delivery of a letter, and then portrays a character’s happiness at reading that letter.",
      "It establishes that a character is desperate to receive a letter, and then explains why another character has not yet written that letter.",
      "It presents a character’s concerns about delivering a letter, and then details the contents of that letter.",
      "It reveals the inspiration behind a character’s letter, and then emphasizes the excitement that another character feels upon receiving that letter.",
    ],
  },
  {
    prompt:
      "Which choice best describes the function of the underlined sentence in the text as a whole?",
    stem: "The following text is from Edith Wharton’s 1905 novel The House of Mirth. Lily Bart and a companion are walking through a park. Lily had no real intimacy with nature, but she had a passion for the appropriate and could be keenly sensitive to a scene which was the fitting background of her own sensations. The landscape outspread below her seemed an enlargement of her present mood, and she found something of herself in its calmness, its breadth, its long free reaches. On the nearer slopes the sugar-maples wavered like pyres of light; lower down was a massing of grey orchards, and here and there the lingering green of an oak-grove.",
    choices: [
      "It creates a detailed image of the physical setting of the scene.",
      "It establishes that a character is experiencing an internal conflict.",
      "It makes an assertion that the next sentence then expands on.",
      "It illustrates an idea that is introduced in the previous sentence.",
    ],
  },
  {
    prompt:
      "Which choice best describes the function of the underlined sentence in the text as a whole?",
    stem: "The following text is adapted from Zora Neale Hurston’s 1921 short story “John Redding Goes to Sea.” John is a child who lives in a town in the woods.\nPerhaps ten-year-old John was puzzling to the folk there in the Florida woods for he was an imaginative child and fond of day-dreams. The St. John River flowed a scarce three hundred feet from his back door. On its banks at this point grow numerous palms, luxuriant magnolias and bay trees. On the bosom of the stream float millions of delicately colored hyacinths. [John Redding] loved to wander down to the water’s edge, and, casting in dry twigs, watch them sail away down stream to Jacksonville, the sea, the wide world and [he] wanted to follow them.",
    choices: [
      "It provides an extended description of a location that John likes to visit.",
      "It reveals that some residents of John’s town are confused by his behavior.",
      "It illustrates the uniqueness of John’s imagination compared to the imaginations of other children.",
      "It suggests that John longs to experience a larger life outside the Florida woods.",
    ],
  },
  {
    prompt: "Which choice best states the main idea of the text?",
    stem: "Eighteenth-century economist Adam Smith is famed for his metaphor of the invisible hand, which he putatively used to illustrate a robust model of how individuals produce aggregate benefits by pursuing their own economic interests. Note “putatively”: as Gavin Kennedy has shown, Smith deploys this metaphor only once in his economic writings—to make a narrow point about the then-dominant economic theory of mercantilism—and it was largely ignored until some twentieth-century economists eager to secure an intellectual pedigree for their views elevated it to a fully-fledged paradigm.",
    choices: [
      "Although Smith is famed for his metaphor of the invisible hand, the metaphor was largely ignored until economists in the twentieth century came to realize that the metaphor was a robust model that anticipated their own views.",
      "Some twentieth-century economists gave Smith’s metaphor of the invisible hand a significance it does not have in Smith’s work, but it is nevertheless a useful model of how individuals produce aggregate benefits by pursuing their own economic interests.",
      "Smith’s metaphor of the invisible hand has been interpreted as a model of how individuals acting in their own interest produce aggregate benefits, but it was intended as a subtle critique of the economic theory of mercantilism.",
      "The reputation of Smith’s metaphor of the invisible hand is not due to the importance of the metaphor in Smith’s work but rather to the promotion of the metaphor by some later economists for their own ends.",
    ],
  },
  {
    prompt:
      "Which quotation from “To You” most effectively illustrates the claim?",
    stem: "“To You” is an 1856 poem by Walt Whitman. In the poem, Whitman suggests that he deeply understands the reader, whom he addresses directly, writing, ______blank",
    choices: [
      "“Your true soul and body appear before me.”",
      "“Whoever you are, now I place my hand upon you, that you be my poem.”",
      "“I should have made my way straight to you long ago.”",
      "“Whoever you are, I fear you are walking the walks of dreams.”",
    ],
  },
  {
    prompt:
      "Which finding, if true, would most directly support the researchers’ hypothesis?",
    stem: "In the mountains of Brazil, Barbacenia tomentosa and Barbacenia macrantha—two plants in the Velloziaceae family—establish themselves on soilless, nutrient-poor patches of quartzite rock. Plant ecologists Anna Abrahão and Patricia de Britto Costa used microscopic analysis to determine that the roots of B. tomentosa and B. macrantha, which grow directly into the quartzite, have clusters of fine hairs near the root tip; further analysis indicated that these hairs secrete both malic and citric acids. The researchers hypothesize that the plants depend on dissolving underlying rock with these acids, as the process not only creates channels for continued growth but also releases phosphates that provide the vital nutrient phosphorus.",
    choices: [
      "Other species in the Velloziaceae family are found in terrains with more soil but have root structures similar to those of B. tomentosa and B. macrantha.",
      "Though B. tomentosa and B. macrantha both secrete citric and malic acids, each species produces the acids in different proportions.",
      "The roots of B. tomentosa and B. macrantha carve new entry points into rocks even when cracks in the surface are readily available.",
      "B. tomentosa and B. macrantha thrive even when transferred to the surfaces of rocks that do not contain phosphates.",
    ],
  },
  {
    prompt: "Which choice most logically completes the text?",
    stem: "A team of biologists led by Jae-Hoon Jung, Antonio D. Barbosa, and Stephanie Hutin investigated the mechanism that allows Arabidopsis thaliana (thale cress) plants to accelerate flowering at high temperatures. They replaced the protein ELF3 in the plants with a similar protein found in another species (stiff brome) that, unlike A. thaliana, displays no acceleration in flowering with increased temperature. A comparison of unmodified A. thaliana plants with the altered plants showed no difference in flowering at 22° Celsius, but at 27° Celsius, the unmodified plants exhibited accelerated flowering while the altered ones did not, which suggests that ______blank",
    choices: [
      "temperature-sensitive accelerated flowering is unique to A. thaliana.",
      "A. thaliana increases ELF3 production as temperatures rise.",
      "ELF3 enables A. thaliana to respond to increased temperatures.",
      "temperatures of at least 22° Celsius are required for A. thaliana to flower.",
    ],
  },
  {
    prompt: "Which choice most logically completes the text?",
    stem: "The domestic sweet potato (Ipomoea batatas) descends from a wild plant native to South America. It also populates the Polynesian Islands, where evidence confirms that Native Hawaiians and other Indigenous peoples were cultivating the plant centuries before seafaring first occurred over the thousands of miles of ocean separating them from South America. To explain how the sweet potato was first introduced in Polynesia, botanist Pablo Muñoz-Rodríguez and colleagues analyzed the DNA of numerous varieties of the plant, concluding that Polynesian varieties diverged from South American ones over 100,000 years ago. Given that Polynesia was peopled only in the last three thousand years, the team concluded that ______blank",
    choices: [
      "the cultivation of the sweet potato in Polynesia likely predates its cultivation in South America.",
      "Polynesian peoples likely acquired the sweet potato from South American peoples only within the last three thousand years.",
      "human activity likely played no role in the introduction of the sweet potato in Polynesia.",
      "Polynesian sweet potato varieties likely descend from a single South American variety that was domesticated, not wild.",
    ],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "In 1966, Emmett Ashford became the first African American to umpire a Major League Baseball game. His energetic gestures announcing when a player had struck out and his habit of barreling after a hit ball to see if it would land out of ______blank transform the traditionally solemn umpire role into a dynamic one.",
    choices: [
      "bounds helped",
      "bounds, helping",
      "bounds that helped",
      "bounds to help",
    ],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "Stomata, tiny pore structures in a leaf that absorb gases needed for plant growth, open when guard cells surrounding each pore swell with water. In a pivotal 2007 article, plant cell ______blank showed that lipid molecules called phosphatidylinositol phosphates are responsible for signaling guard cells to open stomata.",
    choices: [
      "biologist, Yuree Lee",
      "biologist Yuree Lee,",
      "biologist Yuree Lee",
      "biologist, Yuree Lee,",
    ],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "In the late nineteenth and early twentieth centuries, automobiles were commonly referred to as horseless carriages after the older technology they still resembled. Known as the Brass Era, this period in automotive design is remembered for its grandeur and artistry, its vehicles ______blank by collectors for their ornate detailing and gleaming brass fittings.",
    choices: [
      "are highly prized",
      "had been highly prized",
      "highly prized",
      "were highly prized",
    ],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "During the English neoclassical period (1660–1789), many writers imitated the epic poetry and satires of ancient Greece and Rome. They were not the first in England to adopt the literary modes of classical ______blank some of the most prominent figures of the earlier Renaissance period were also influenced by ancient Greek and Roman literature.",
    choices: [
      "antiquity, however",
      "antiquity, however,",
      "antiquity, however;",
      "antiquity; however,",
    ],
  },
  {
    prompt: "Which choice most logically completes the text?",
    stem: "Among social animals that care for their young, such as chickens, macaque monkeys, and humans, newborns appear to show an innate attraction to faces and face-like stimuli. Elisabetta Versace and her colleagues used an image of three black dots arranged in the shape of eyes and a nose or mouth to test whether this trait also occurs in Testudo tortoises, which live alone and do not engage in parental care. They found that tortoise hatchlings showed a significant preference for the image, suggesting that ______blank",
    choices: [
      "face-like stimuli are likely perceived as harmless by newborns of social species that practice parental care but as threatening by newborns of solitary species without parental care.",
      "researchers should not assume that an innate attraction to face-like stimuli is necessarily an adaptation related to social interaction or parental care.",
      "researchers can assume that the attraction to face-like stimuli that is seen in social species that practice parental care is learned rather than innate.",
      "newly hatched Testudo tortoises show a stronger preference for face-like stimuli than adult Testudo tortoises do.",
    ],
  },
  {
    prompt: "Which choice most logically completes the text?",
    stem: "In a study of the cognitive abilities of white-faced capuchin monkeys (Cebus imitator), researchers neglected to control for the physical difficulty of the tasks they used to evaluate the monkeys. The cognitive abilities of monkeys given problems requiring little dexterity, such as sliding a panel to retrieve food, were judged by the same criteria as were those of monkeys given physically demanding problems, such as unscrewing a bottle and inserting a straw. The results of the study, therefore, ______blank",
    choices: [
      "could suggest that there are differences in cognitive ability among the monkeys even though such differences may not actually exist.",
      "are useful for identifying tasks that the monkeys lack the cognitive capacity to perform but not for identifying tasks that the monkeys can perform.",
      "should not be taken as indicative of the cognitive abilities of any monkey species other than C. imitator.",
      "reveal more about the monkeys’ cognitive abilities when solving artificial problems than when solving problems encountered in the wild.",
    ],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "Recent pollen analyses of the Aran Islands have led some researchers to propose that the now treeless islands were once wooded. This hypothesis ______blank that certain trees, such as P. sylvestris, survived without interruption or human intervention throughout the Holocene cannot stand, researchers Michael O’Connell and Karen Molloy counter, unless other explanations can first be ruled out.",
    choices: ["suggesting", "suggested", "suggests", "has suggested"],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "Atoms in a synchrotron, a type of circular particle accelerator, travel faster and faster until they ______blank a desired energy level, at which point they are diverted to collide with a target, smashing the atoms.",
    choices: ["will reach", "reach", "had reached", "are reaching"],
  },
  {
    prompt:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    stem: "Compared to that of alumina glass, ______blank silica glass atoms are so far apart that they are unable to re-form bonds after being separated.",
    choices: [
      "silica glass is at a significant disadvantage due to its more dispersed atomic arrangement:",
      "silica glass has a more dispersed atomic arrangement, resulting in a significant disadvantage:",
      "a significant disadvantage of silica glass is that its atomic arrangement is more dispersed:",
      "silica glass’s atomic arrangement is more dispersed, resulting in a significant disadvantage:",
    ],
  },
  {
    prompt: "Which choice completes the text with the most logical transition?",
    stem: "With his room-sized installation Unicorn/My Private Sky, Norwegian artist Børre Sæthre succeeds in creating a whimsical yet perplexing experience. ______blank when visitors set foot inside the fantastically blue room and encounter the life-sized stuffed unicorn preening at the far end of it, they are both dazzled and confused—as if stepping into a strange and enchanting new world.",
    choices: ["Second,", "Instead,", "Indeed,", "Nevertheless,"],
  },
  {
    prompt: "Which choice completes the text with the most logical transition?",
    stem: "Economist Elinor Ostrom’s studies of communities around the world have empirically demonstrated that common pool resources, such as grazing lands, can be sustainably managed by the people who use them (rather than through private entities or centralized governments). ______blank Ostrom’s work is a repudiation of the “tragedy of the commons,” the view that individuals will inevitably overexploit a finite shared resource if given unfettered access to it.",
    choices: ["By contrast,", "For example,", "That said,", "As such,"],
  },
  {
    prompt:
      "The student wants to emphasize a similarity between the two books by Shaun Tan. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: Shaun Tan is an Australian author. In 2008, he published Tales from Outer Suburbia, a book of fifteen short stories. The stories describe surreal events occurring in otherwise ordinary suburban neighborhoods. In 2018, he published Tales from the Inner City, a book of twenty-five short stories. The stories describe surreal events occurring in otherwise ordinary urban settings.",
    choices: [
      "Shaun Tan’s book Tales from Outer Suburbia, which describes surreal events occurring in otherwise ordinary places, contains fewer short stories than Tales from the Inner City does.",
      "Tales from Outer Suburbia was published in 2008, and Tales from the Inner City was published in 2018.",
      "Unlike Tales from the Inner City, Shaun Tan’s book Tales from Outer Suburbia is set in suburban neighborhoods.",
      "Shaun Tan’s books Tales from Outer Suburbia and Tales from the Inner City both describe surreal events occurring in otherwise ordinary places.",
    ],
  },
  {
    prompt:
      "The student wants to present the Quanhucun study and its conclusions. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: In 2013, archaeologists studied cat bone fragments they had found in the ruins of Quanhucun, a Chinese farming village. The fragments were estimated to be 5,300 years old. A chemical analysis of the fragments revealed that the cats had consumed large amounts of grain. The grain consumption is evidence that the Quanhucun cats may have been domesticated.",
    choices: [
      "As part of a 2013 study of cat domestication, a chemical analysis was conducted on cat bone fragments found in Quanhucun, China.",
      "A 2013 analysis of cat bone fragments found in Quanhucun, China, suggests that cats there may have been domesticated 5,300 years ago.",
      "In 2013, archaeologists studied what cats in Quanhucun, China, had eaten more than 5,000 years ago.",
      "Cat bone fragments estimated to be 5,300 years old were found in Quanhucun, China, in 2013.",
    ],
  },
  {
    prompt:
      "The student wants to introduce the artist’s 1983 poetry collection. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: Cecilia Vicuña is a multidisciplinary artist. In 1971, her first solo art exhibition, Pinturas, poemas y explicaciones, was shown at the Museo Nacional de Bellas Artes in Santiago, Chile. Her poetry collection Precario/Precarious was published in 1983 by Tanam Press. Her poetry collection Instan was published in 2002 by Kelsey St. Press. She lives part time in Chile, where she was born, and part time in New York.",
    choices: [
      "Before she published the books Precario/Precarious (1983) and Instan (2002), Cecilia Vicuña exhibited visual art at the Museo Nacional de Bellas Artes in Santiago, Chile.",
      "Cecilia Vicuña is a true multidisciplinary artist whose works include numerous poetry collections and visual art exhibitions.",
      "Published in 1983 by Tanam Press, Precario/Precarious is a collection of poetry by the multidisciplinary artist Cecilia Vicuña.",
      "In 1971, Cecilia Vicuña exhibited her first solo art exhibition, Pinturas, poemas y explicaciones, in Chile, her country of birth.",
    ],
  },
  {
    prompt:
      "The student wants to emphasize the aim of the research study. Which choice effectively uses information from the notes to accomplish this goal?",
    stem: "While researching a topic, a student has taken the following notes: The factors that affect clutch size (the number of eggs laid at one time) have been well studied in birds but not in lizards. A team led by Shai Meiri of Tel Aviv University investigated which factors influence lizard clutch size. Meiri’s team obtained clutch-size and habitat data for over 3,900 lizard species and analyzed the data with statistical models. Larger clutch size was associated with environments in higher latitudes that have more seasonal change. Lizards in higher-latitude environments may lay larger clutches to take advantage of shorter windows of favorable conditions.",
    choices: [
      "Researchers wanted to know which factors influence lizard egg clutch size because such factors have been well studied in birds but not in lizards.",
      "After they obtained data for over 3,900 lizard species, researchers determined that larger clutch size was associated with environments in higher latitudes.",
      "We now know that lizards in higher-latitude environments may lay larger clutches to take advantage of shorter windows of favorable conditions.",
      "Researchers obtained clutch-size and habitat data for over 3,900 lizard species and analyzed the data with statistical models.",
    ],
  },
];
/* ---------------------------- Math вопросы ---------------------------- */
const MATH_QUESTIONS = [
  {
    stem: "A veterinarian recommends that each day a certain rabbit should eat 25 calories per pound of the rabbit’s weight, plus an additional 11 calories. Which equation represents this situation, where c is the total number of calories the rabbit should eat each day if the rabbit’s weight is x pounds?",
    choices: ["c = 25x", "c = 36x", "c = 11x + 25", "c = 25x + 11"],
  },
  {
    stem: "A special camera is used for underwater ocean research. The camera is at a depth of 39 fathoms. What is the camera's depth in feet? (1 fathom = 6 feet)",
    choices: ["234", "117", "45", "7"],
  },
  {
    stem: "The function f(x) = 14 + 4x represents the total cost, in dollars, of attending an arcade when x games are played. How many games can be played for a total cost of 58 dollars?",
    grid: true,
  },
  {
    stem: "If 4x − 28 = −24, what is the value of x − 7?",
    choices: ["−24", "−22", "−6", "−1"],
  },
  {
    stem: "The amount of Hanna's bill for a food order was 50 dollars. Hanna gave a tip of 20% of the amount of the bill. What is the amount, in dollars, of the tip Hanna gave?",
    grid: true,
  },
  {
    stem: "In the xy-plane, line t passes through the points (0, 9) and (1, 17). Which equation defines line t?",
    choices: ["y = (1/8)x + 9", "y = x + 1/8", "y = x + 8", "y = 8x + 9"],
  },
  {
    stem: "(d − 30)(d + 30) − 7 = −7. What is a solution to the equation?",
    grid: true,
  },
  {
    stem: "A store sells two different-sized containers of blueberries. The store’s sales of these blueberries totaled 896.86 dollars last month. The equation 4.51x + 6.07y = 896.86 represents this situation, where x is the number of smaller containers sold and y is the number of larger containers sold. According to the equation, what is the price, in dollars, of each smaller container?",
    grid: true,
  },
  {
    stem: "The length of each edge of a box is 29 inches. Each side of the box is a square. The box does not have a lid. What is the exterior surface area, in square inches, of this box without a lid?",
    grid: true,
  },
  {
    stem: "|x − 9| + 45 = 63. What is the sum of the solutions to this equation?",
    grid: true,
  },
  {
    stem: "A right rectangular prism has a height of 9 inches. The length of the prism's base is x inches, which is 7 inches more than the width of the prism's base. Which function V gives the volume of the prism, in cubic inches, in terms of the length x of the prism's base?",
    choices: [
      "V(x) = x(x + 9)(x + 7)",
      "V(x) = x(x + 9)(x − 7)",
      "V(x) = 9x(x + 7)",
      "V(x) = 9x(x − 7)",
    ],
  },
  {
    stem: "The function f is defined by f(x) = a√(x + b), where a and b are constants. In the xy-plane, the graph of y = f(x) passes through the point (−24, 0), and f(24) < 0. Which of the following must be true?",
    choices: ["f(0) = 24", "f(0) = −24", "a > b", "a < b"],
  },
  {
    stem: "The equation x + y = 1440 represents the number of minutes of daylight (between sunrise and sunset), x, and the number of minutes of non-daylight, y, on a particular day in Oak Park, Illinois. If this day has 670 minutes of daylight, how many minutes of non-daylight does it have?",
    choices: ["670", "770", "1440"],
  },
  {
    stem: "Scott selected 20 employees at random from all 400 employees at a company. He found that 16 of the employees in this sample are enrolled in exactly three professional development courses this year. Based on Scott’s findings, which is the best estimate of the number of employees at the company who are enrolled in exactly three professional development courses this year?",
    choices: ["4", "320", "380", "384"],
  },
  {
    stem: "7(2x − 3) = 63. Which equation has the same solution as this equation?",
    choices: ["2x − 3 = 9", "2x − 3 = 56", "2x − 21 = 63", "2x − 21 = 70"],
  },
  {
    stem: "A function p estimates that there were 2,000 animals in a population in 1998. Each year from 1998 to 2010, the function estimates that the number of animals in this population increased by 3% of the number of animals in the population the previous year. Which equation defines this function, where p(x) is the estimated number of animals in the population x years after 1998?",
    choices: [
      "p(x) = 2000(3)^x",
      "p(x) = 2000(1.97)^x",
      "p(x) = 2000(1.03)^x",
      "p(x) = 2000(0.97)^x",
    ],
  },
  {
    stem: "If 4√(2x) = 16, what is the value of 6x?",
    choices: ["24", "48", "72", "96"],
  },
  {
    stem: "The length of the edge of the base of a right square prism is 6 units. The volume of the prism is 2,880 cubic units. What is the height, in units, of the prism?",
    choices: ["4√30", "36", "24√5", "80"],
  },
  {
    stem: "(x + 2)(x − 5)(x + 9) = 0. What is a positive solution to this equation?",
    choices: ["3", "4", "5", "18"],
  },
  {
    stem: "The function g is defined by g(x) = (x + 14)(t − x), where t is a constant. In the xy-plane, the graph of y = g(x) passes through the point (24, 0). What is the value of g(0)?",
    grid: true,
  },
  {
    stem: "The number of zebras in a population in 2018 was 1.27 times the number of zebras in this population in 2014. If the number of zebras in this population in 2014 is p% of the number of zebras in this population in 2018, what is the value of p, to the nearest whole number?",
    grid: true,
  },
  {
    stem: "Line ℓ is defined by 3y + 12x = 5. Line n is perpendicular to line ℓ in the xy-plane. What is the slope of line n?",
    grid: true,
  },
];
/* ------------------------- Math вопросы (набор 2) ------------------------- */
const MATH_QUESTIONS_2 = [
  {
    stem: "The function g is defined by g(x) = |2x - 5| - 3. For which value of x is g(x) = 0?",
    choices: ["1", "2", "4", "5"],
  },
  {
    stem: "Solve for x: 5x² − 13x + 6 = 0. Enter the larger solution.",
    grid: true,
  },
  {
    stem: "The quadratic function f(x) = ax² + bx + c has zeros at x = -2 and x = 5 and passes through the point (1, -12). What is the value of a?",
    choices: ["-1", "-2", "1", "2"],
  },
  {
    stem: "A line passes through the points (2, 7) and (8, -5). Enter the slope of the line.",
    grid: true,
  },
  {
    stem: "The line with equation y = -3x + 10 is reflected across the x-axis. What is the equation of the image line?",
    choices: ["y = 3x + 10", "y = -3x - 10", "y = 3x - 10", "y = -3x + 10"],
  },
  {
    stem: "A data set has five numbers. Four of the numbers are 6, 9, 9, and 10. The mean of all five numbers is 11. Enter the missing number.",
    grid: true,
  },
  {
    stem: "A circle has center (4, -1) and radius 5. Which of the following points lies on the circle?",
    choices: ["(4, 4)", "(9, -1)", "(0, -4)", "(8, 3)"],
  },
  {
    stem: "The sum of three consecutive integers is 111. Enter the largest of the three integers.",
    grid: true,
  },
  {
    stem: "The average (arithmetic mean) of five numbers is 18. When one number is removed, the average of the remaining four numbers is 16. What number was removed?",
    choices: ["10", "14", "18", "26"],
  },
  {
    stem: "A savings account has an initial balance of 500 dollars and grows by 4% each year, compounded annually. Which expression gives the balance, in dollars, after t years?",
    choices: ["500 + 0.04t", "500(1.04)ᵗ", "500(0.96)ᵗ", "500(1 + 4t)"],
  },
  {
    stem: "The inequality 4(2x − 3) + 5 ≤ 3(x + 1) is equivalent to which of the following?",
    choices: ["x ≤ -1", "x ≥ -1", "x ≤ 17", "x ≥ 17"],
  },
  {
    stem: "In a right triangle, one acute angle measures 35°. What is the measure, in degrees, of the other acute angle?",
    grid: true,
  },
  {
    stem: "The system of equations 3x + ky = 12 and 2x - 4y = 8 has no solution. What is the value of k?",
    choices: ["-6", "-3", "3", "6"],
  },
  {
    stem: "A bag contains 5 red, 7 blue, and 8 green marbles. One marble is chosen at random. What is the probability that the marble is not blue?",
    choices: ["5/20", "8/20", "13/20", "15/20"],
  },
  {
    stem: "In a right triangle, one leg has length 9 and the hypotenuse has length 15. What is the length of the other leg?",
    choices: ["6", "9√2", "12", "√306"],
  },
  {
    stem: "For x > 0, the function p(x) = x + 16/x has a minimum value at some x. Enter that value of x.",
    grid: true,
  },
  {
    stem: "The line y = -3x + 10 is reflected across the x-axis. What is the equation of the image line?",
    choices: ["y = 3x + 10", "y = -3x - 10", "y = 3x - 10", "y = -3x + 10"],
  },
  {
    stem: "A cylindrical tank has radius 4 meters and height 6 meters. What is its volume, in cubic meters, in terms of π? (Use the form aπ.)",
    grid: true,
  },
  {
    stem: "The solutions to the equation x² - 8x + k = 0 are 4 ± √7. What is the value of k?",
    choices: ["7", "9", "16", "23"],
  },
  {
    stem: "The function h is defined by h(x) = 3(2ˣ) − 5. What is the value of x such that h(x) = 19?",
    choices: ["1", "2", "3", "4"],
  },
  {
    stem: "The function f is defined by f(x) = 2x² − 5x + 1. What is the value of f(3)?",
    grid: true,
  },
  {
    stem: "A rectangle has length 3x + 4 and width x − 1. Its area is 44 square units. What is the value of x?",
    choices: ["3", "4", "5", "6"],
  },
];

/* ---------------- stages ---------------- */
export const STAGES = [
  { sec: 1, mod: 1, title: "Reading and Writing", mins: 32, qs: RW_QUESTIONS },
  {
    sec: 1,
    mod: 2,
    title: "Reading and Writing",
    mins: 32,
    qs: RW_QUESTIONS_2,
  },
  { id: "break", mins: 10 },
  { sec: 2, mod: 1, title: "Math", mins: 35, qs: MATH_QUESTIONS },
  { sec: 2, mod: 2, title: "Math", mins: 35, qs: MATH_QUESTIONS_2 },
];
