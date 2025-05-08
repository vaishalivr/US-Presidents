import { writable } from "svelte/store";

export const presidents = writable([
  {
    name: "George Washington",
    terms: 2,
    status: "dead",
    birthYear: 1732,
    birthPlace: "Westmoreland County, Virginia",
    parents: "Augustine Washington and Mary Ball Washington",
    deathYear: 1799,
    deathPlace: "Mount Vernon, Virginia",
    deathReason: "Epiglottitis or pneumonia",
    presidencyStart: 1789,
    presidencyEnd: 1797,
    keyPolicies: 8,
    policies: [
      "Judiciary Act of 1789 : Established the federal judiciary, including the Supreme Court, circuit courts, and district courts.",
      "First National Bank (1791) : Championed by Alexander Hamilton, Washington supported the creation of a national bank to stabilize the economy.",
      "Bill of Rights (1791) : Ratified during his presidency, ensuring fundamental liberties for citizens.",
      "Proclamation of Neutrality (1793) : Declared the U.S. neutral in the war between France and Britain, preventing early entanglement in European conflicts.",
      "Whiskey Rebellion Suppression (1794) : Sent federal troops to put down a tax protest, reinforcing the strength of the federal government.",
      "Jay Treaty (1795) : A controversial treaty with Britain that sought to resolve lingering issues from the Revolutionary War and promote trade.",
      "Pinckney’s Treaty (1795) : Agreement with Spain that granted the U.S. navigation rights on the Mississippi River and access to New Orleans.",
      "Farewell Address (1796) : Though not a law, his address warned against political parties and entangling foreign alliances, shaping U.S. policy for years.",
    ],
    party: "None",
    spouse: "Martha Custis",
    children: "None",
    occupationBeforePresidency: "Farmer and Soldier",
    quote:
      "To be prepared for war is one of the most effective means of preserving peace.",
    image: "images/GeorgeWashington.png",
    otherPresidents: [
      "John Adams",
      "Thomas Jefferson",
      "James Madison",
      "James Monroe",
      "John Quincy Adams",
    ],
    otherPresidentThings: [
      { "John Adams": "Vice President of the US" },
      {
        "Thomas Jefferson":
          "Served as Washington's first Secretary of State but resigned in 1793 due to conflicts with Washington and Alexander Hamilton",
        "James Madison":
          "Member of the U.S. House of Representatives (1789-1797) and helped form the Democratic-Republican Party with Jefferson",
      },
      { "James Monroe": "U.S. Minister to France (1794-1796), later recalled" },
      {
        "John Quincy Adams":
          "Graduated from Harvard University in 1787 and began studying law. Admitted to the bar in 1790, he started practicing law in Boston",
      },
    ],
  },
  {
    name: "John Adams",
    terms: 2,
    status: "dead",
    birthYear: 1735,
    birthPlace: "Braintree, Massachusetts",
    parents: "John Adams Sr. and Susanna Boylston",
    deathYear: 1826,
    deathPlace: "Quincy, Massachusetts",
    deathReason: "Heart failure and natural causes",
    presidencyStart: 1797,
    presidencyEnd: 1801,
    keyPolicies: 9,
    policies: [
      "Alien and Sedition Acts (1798) : A series of laws that made it harder for immigrants to become citizens, allowed the president to deport non-citizens deemed dangerous, and criminalized criticism of the government.",
      "XYZ Affair (1797-1798) : A diplomatic scandal in which French agents demanded bribes from U.S. envoys, leading to the Quasi-War with France.",
      "Quasi-War with France (1798-1800) : An undeclared naval war between the U.S. and France, leading Adams to strengthen the U.S. Navy.",
      "Creation of the Department of the Navy (1798) : Established a permanent U.S. Navy to counter threats from France and other nations.",
      "Midnight Appointments (1801) : Adams appointed numerous Federalist judges, including Chief Justice John Marshall, shaping U.S. law for decades.",
      "Naturalization Act of 1798 : Increased the residency requirement for citizenship from 5 to 14 years, making it harder for immigrants to become citizens.",
      "Treaty of Mortefontaine (1800) : Ended hostilities between the U.S. and France, preventing an all-out war.",
      "Direct Tax of 1798 : Imposed a federal property tax, which led to protests such as Fries' Rebellion in Pennsylvania.",
      "Virginia and Kentucky Resolutions response (1798-1799) : Though not his policy, these resolutions by Jefferson and Madison challenged the Alien and Sedition Acts, arguing states could nullify federal laws.",
    ],
    party: "Federalist",
    spouse: "Abigail Adams",
    children: "None",
    occupationBeforePresidency: "Lawyer",
    quote:
      "I must study politics and war that my sons may have liberty to study mathematics and philosophy.",
    image: "images/JohnAdams.png",
    otherPresidents: [
      "George Washington",
      "Thomas Jefferson",
      "James Madison",
      "James Monroe",
      "John Quincy Adams",
      "Andrew Jackson",
      "Martin Van Buren",
      "William Henry Harrison",
    ],
    otherPresidentThings: [
      {
        "George Washington":
          "returned to his Mount Vernon estate in Virginia, focusing on managing his plantation. Reappointed Commander-in-Chief during Quasi-War with France",
      },
      {
        "Thomas Jefferson":
          "Jefferson lost the 1796 presidential election to John Adams. At the time, the candidate with the second-most votes became Vice President, so he served under Adams despite being from an opposing political party. This created serious tensions in the government. In 1800 Ran against Adams, won the election",
      },
      {
        "James Madison":
          "Democratic-Republican leader, opposed Adams, co-wrote Virginia Resolution (1798)",
      },
      {
        "James Monroe":
          "U.S. Senator (1799-1802), opposed Adams, supported Jefferson's 1800 election",
      },
      {
        "John Quincy Adams":
          "U.S. Minister to Prussia (1797-1801), worked on trade agreements",
      },
      {
        "Andrew Jackson":
          "U.S. Senator (1797-1798), Tennessee Supreme Court Judge (1798-1804)",
      },
      {
        "Martin Van Buren":
          "New York State Senator (1799-1803), emerging Democratic-Republican leader",
      },
      {
        "William Henry Harrison":
          "Served in the U.S. Army, fought in Indian Wars(1791-1798), Secretary of the Northwest Territory, appointed by Adams(1798-1799), 	Delegate to U.S. Congress for Northwest Territory(1799-1801)",
      },
    ],
  },
  {
    name: "Thomas Jefferson",
    status: "dead",
    birthYear: 1743,
    birthPlace: "Shadwell, Virginia",
    parents: "Peter Jefferson and Jane Randolph",
    deathYear: 1826,
    deathPlace: "Monticello, Virginia",
    deathReason: "Kidney infection and natural causes",
    presidencyStart: 1801,
    presidencyEnd: 1809,
    keyPolicies: 12,
    policies: [
      "Louisiana Purchase (1803) : Doubled the size of the United States by acquiring 828,000 square miles of land from France for $15 million.",
      "Embargo Act of 1807 : Prohibited American ships from trading with foreign nations, aimed at pressuring Britain and France to respect U.S. neutrality but severely hurt the U.S. economy.",
      "Marbury v. Madison (1803) : Though not a policy, this Supreme Court decision established judicial review, strengthening the judiciary.",
      "Reduction of National Debt : Jefferson significantly cut federal spending and reduced the national debt by slashing military expenditures.",
      "Abolition of Internal Taxes : Repealed various federal taxes, such as the whiskey tax, reducing the tax burden on citizens.",
      "Lewis and Clark Expedition (1804-1806) : Commissioned an expedition to explore the newly acquired Louisiana Territory, mapping out the land and establishing relations with Native American tribes.",
      "Non-Intercourse Act (1809) : Replaced the Embargo Act, reopening trade with all nations except Britain and France to mitigate economic damage.",
      "Slave Trade Act of 1807 : Signed into law, prohibiting the importation of slaves into the U.S.",
      "Military and Naval Reductions : Reduced the standing army and navy, favoring state militias over a large federal military.",
      "Tripolitan War (1801-1805) : The first Barbary War against North African pirates, demonstrating the U.S. naval strength and asserting maritime rights.",
      "Yazoo Land Scandal Resolution (1802) : Helped resolve land disputes in Georgia by compensating claimants and transferring land to federal control.",
      "Twelfth Amendment (1804) : Changed the process of electing the president and vice president, requiring them to be elected as a ticket rather than separately.",
    ],
    party: "Democratic-Republican",
    spouse: "Martha Wayles Skelton Jefferson",
    children: "None",
    occupationBeforePresidency: "Planter and Lawyer",
    quote:
      "The man who reads nothing at all is better educated than the man who reads nothing but newspapers.",
    image: "images/ThomasJefferson.png",
    otherPresidents: [
      "John Adams",
      "James Madison",
      "James Monroe",
      "John Quincy Adams",
      "Andrew Jackson",
      "Martin Van Buren",
      "William Henry Harrison",
      "John Tyler",
    ],
    otherPresidentThings: [
      {
        "John Adams":
          "After losing election to Jefferson, Adams left DC and returned to his farm in Quincy MA largly avoiding public life. When Jefferson's presidency ended Adam and Jefferson started exchanging letters rekindling their friendship.",
      },
      {
        "James Madison":
          "	Secretary of State (1801-1809), helped oversee Louisiana Purchase,",
      },
      {
        "James Monroe":
          "	Negotiator of Louisiana Purchase (1803), Minister to Britain (1803-1806), Governor of Virginia (1807-1809)",
      },
      {
        "John Quincy Adams":
          "U.S. Senator (1803-1808), broke with Federalists, supported Louisiana Purchase, appointed Minister to Russia (1809)",
      },
      {
        "Andrew Jackson":
          "Judge in Tennessee (1804-1809), military leader, duel with Dickinson (1806)",
      },
      {
        "Martin Van Buren":
          "Practiced law (1801-1803), became Surrogate Judge (1803-1808), elected to New York Senate (1808)",
      },
      {
        "William Henry Harrison":
          "Governor of Indiana Territory (1801-1809), negotiated land treaties, expanded U.S. settlements",
      },
      {
        "John Tyler":
          "Law student (1801-1807), began law practice (1807), elected to Virginia House of Delegates (1809)",
      },
    ],
  },
  {
    name: "James Madison",
    terms: 2,
    status: "dead",
    birthYear: 1751,
    birthPlace: "Port Conway, Virginia",
    parents: "James Madison Sr. and Nelly Conway Madison",
    deathYear: 1836,
    deathPlace: "Montpelier, Virginia",
    deathReason: "Heart failure and natural causes",
    presidencyStart: 1809,
    presidencyEnd: 1817,
    keyPolicies: 8,
    policies: [
      "War of 1812 (1812-1815) : A major conflict between the U.S. and Britain over maritime rights, impressment of American sailors, and British support for Native American resistance. The war solidified U.S. sovereignty but ended in a stalemate.",
      "Treaty of Ghent (1814) : Officially ended the War of 1812, restoring pre-war borders between the U.S. and Britain but failing to resolve many of the war’s original causes.",
      "Creation of the Second Bank of the United States (1816) : Established to provide financial stability after the economic strain of the war, helping regulate currency and credit.",
      "Tariff of 1816 : The first protective tariff in U.S. history, designed to protect American manufacturing by taxing imported goods, making domestic products more competitive.",
      "Macon’s Bill No. 2 (1810) : A policy that reopened trade with Britain and France but threatened an embargo if either nation interfered with American shipping. It failed to prevent tensions leading to the War of 1812.",
      "Expansion of the U.S. Military : Strengthened the U.S. Army and Navy after recognizing weaknesses during the War of 1812, leading to improvements in national defense.",
      "Federal Internal Improvements Plan : Proposed using federal funds for infrastructure like roads and canals, though Madison vetoed the Bonus Bill, believing states should fund such projects.",
      "Rush-Bagot Agreement (1817) : A treaty with Britain that limited naval armaments on the Great Lakes, helping to ease U.S.-British tensions and laying the groundwork for peaceful U.S.-Canada relations.",
    ],

    party: "Democratic-Republican",
    spouse: "Dolley Payne Todd Madison",
    children: "None",
    occupationBeforePresidency: "Farmer and Politician",
    quote:
      "The means of defense against foreign danger have always been the instruments of tyranny at home.",
    image: "images/JamesMadison.png",
    otherPresidents: [
      "Thomas Jefferson",
      "James Monroe",
      "John Quincy Adams",
      "Andrew Jackson",
      "Martin Van Buren",
      "William Henry Harrison",
      "John Tyler",
      "James K. Polk",
    ],
    otherPresidentThings: [
      {
        "Thomas Jefferson":
          "Retired to Monticello after his presidency (1809), remained politically engaged in correspondence, founded the University of Virginia (chartered in 1819).",
      },
      {
        "James Monroe":
          "Secretary of State (1811–1817) and Secretary of War during War of 1812; key figure in foreign affairs and military strategy; succeeded Madison as president.",
      },
      {
        "John Quincy Adams":
          "Served as U.S. Minister to Russia (1809–1814), negotiated Treaty of Ghent (1814) ending the War of 1812.",
      },
      {
        "Andrew Jackson":
          "Major General in Tennessee militia; achieved national fame for victories in War of 1812, especially Battle of New Orleans (1815).",
      },
      {
        "Martin Van Buren":
          "Practiced law in New York; elected to New York State Senate (1812); gained influence in state politics.",
      },
      {
        "William Henry Harrison":
          "Army officer during War of 1812; commanded U.S. forces in Northwest, including victory at Battle of the Thames (1813).",
      },
      {
        "John Tyler":
          "Elected to U.S. House of Representatives (1816); previously served in Virginia House of Delegates and as a lawyer.",
      },
      {
        "James K. Polk":
          "Teenager during Madison’s presidency; enrolled at University of North Carolina (1816), preparing for public life.",
      },
    ],
  },
  {
    name: "James Monroe",
    terms: 2,
    status: "dead",
    birthYear: 1758,
    birthPlace: "Westmoreland County, Virginia",
    parents: "Spence Monroe and Elizabeth Jones",
    deathYear: 1831,
    deathPlace: "New York City, New York",
    deathReason: "Tuberculosis",
    presidencyStart: 1817,
    presidencyEnd: 1825,
    keyPolicies: 8,
    policies: [
      "Monroe Doctrine (1823) : Declared that European powers should not interfere in the Western Hemisphere, asserting U.S. dominance in the Americas and shaping foreign policy for decades.",
      "Missouri Compromise (1820) : Allowed Missouri to enter as a slave state and Maine as a free state, maintaining the balance of power between free and slave states in Congress.",
      "Acquisition of Florida (1819) : Secured Florida from Spain through the Adams-Onís Treaty, expanding U.S. territory.",
      "Panic of 1819 : The first major financial crisis in U.S. history, caused by land speculation and unstable banking practices, leading to widespread economic hardship.",
      "Cumberland Road Expansion : Supported federal funding for infrastructure improvements, particularly roads and canals, to enhance national transportation.",
      "Era of Good Feelings : Though not a policy, this period during Monroe’s presidency was characterized by political unity and the decline of the Federalist Party.",
      "Reduction of Military Spending : Monroe reduced military expenditures while strengthening coastal defenses and fortifications.",
      "Recognition of Latin American Independence : The U.S. formally recognized the independence of several Latin American nations from Spain, reinforcing the Monroe Doctrine.",
    ],
    party: "Democratic-Republican",
    spouse: "Elizabeth Kortright Monroe",
    children: "3",
    occupationBeforePresidency: "Lawyer and Soldier",
    quote: "National honor is the national property of the highest value.",
    image: "images/JamesMonroe.png",
    otherPresidents: [
      "Thomas Jefferson",
      "James Madison",
      "John Quincy Adams",
      "Andrew Jackson",
      "Martin Van Buren",
      "William Henry Harrison",
      "John Tyler",
      "James K. Polk",
      "William Henry Harrison",
    ],
    otherPresidentThings: [
      {
        "Thomas Jefferson":
          "In retirement at Monticello; continued prolific correspondence, helped found the University of Virginia (opened in 1825), remained a mentor to younger statesmen.",
      },
      {
        "James Madison":
          "Retired to Montpelier after presidency; served as Rector of the University of Virginia; advised Monroe privately on constitutional issues.",
      },
      {
        "John Quincy Adams":
          "Secretary of State (1817–1825); negotiated Adams–Onís Treaty (1819) acquiring Florida; key architect of the Monroe Doctrine.",
      },
      {
        "Andrew Jackson":
          "Led campaigns in First Seminole War (1817–1818); Military Governor of Florida (1821); returned to Tennessee politics after military service.",
      },
      {
        "Martin Van Buren":
          "New York State Senator (1816–1820), Attorney General of New York (1815–1819), and U.S. Senator from New York (1821–1828); rising national Democratic-Republican figure.",
      },
      {
        "John Tyler":
          "Served in the U.S. House of Representatives (1816–1821); returned to Virginia House of Delegates (1823).",
      },
      {
        "James K. Polk":
          "Attended the University of North Carolina (graduated 1818); studied law and entered legal practice (admitted to bar 1820).",
      },
      {
        "William Henry Harrison":
          "Served as U.S. Congressman from Ohio (1816–1819); ran unsuccessfully for Ohio governor (1820); continued political involvement in the Northwest.",
      },
    ],
  },
  {
    name: "John Quincy Adams",
    status: "dead",
    birthYear: 1767,
    birthPlace: "Braintree, Massachusetts",
    parents: "John Adams and Abigail Adams",
    deathYear: 1848,
    deathPlace: "Washington, D.C.",
    deathReason: "Stroke",
    presidencyStart: 1825,
    presidencyEnd: 1829,
    keyPolicies: 8,
    policies: [
      "Tariff of 1828 (Tariff of Abominations) : Raised import duties on imported goods, which benefited Northern industries but caused economic tensions in the South.",
      "Erie Canal Completion (1825) : Expanded trade and transportation routes, boosting economic development and connecting the Great Lakes with the Atlantic Ocean.",
      "Support for the American System : Advocated for infrastructure improvements, tariffs to protect U.S. industries, and a national bank to support economic growth.",
      "Expansion of Education : Promoted public education, federal funding for research institutions, and scientific advancements.",
      "Naval Expansion : Strengthened the U.S. Navy to protect American commerce and national security.",
      "Standardization of Weights and Measures : Pushed for a uniform system of weights and measures to facilitate trade and commerce.",
      "Diplomatic Engagement with Latin America : Sought to strengthen ties with newly independent Latin American nations through diplomatic missions.",
      "Creation of the Department of Interior Proposal : Proposed a department to manage internal improvements and land policies, though it was not established during his presidency.",
    ],
    party: "Democratic-Republican",
    spouse: "Louisa Catherine Johnson Adams",
    children: "4",
    occupationBeforePresidency: "Diplomat and Lawyer",
    quote:
      "If your actions inspire others to dream more, learn more, do more, and become more, you are a leader.",
    image: "images/JohnQuincyAdams.png",
    otherPresidents: [
      "Thomas Jefferson",
      "James Madison",
      "James Monroe",
      "Andrew Jackson",
      "Martin Van Buren",
      "William Henry Harrison",
      "John Tyler",
      "James K. Polk",
      "William Henry Harrison",
    ],
    otherPresidentThings: [
      {
        "Thomas Jefferson":
          "In retirement at Monticello; remained a public intellectual and oversaw the final years of the University of Virginia; died in 1826 on the 50th anniversary of the Declaration of Independence.",
      },
      {
        "James Madison":
          "Retired at Montpelier; served on the board of the University of Virginia and remained active in correspondence on political theory; died in 1836.",
      },
      {
        "James Monroe":
          "Lived in relative obscurity in Virginia following his presidency; faced financial difficulties; died in 1831.",
      },
      {
        "Andrew Jackson":
          "Ran against Adams in the highly contested 1824 election (lost via House decision); campaigned heavily and won the 1828 election, defeating Adams.",
      },
      {
        "Martin Van Buren":
          "Served as U.S. Senator from New York; strong organizer of the Democratic Party; opposed many Adams policies and helped Jackson's 1828 campaign.",
      },
      {
        "John Tyler":
          "Served in the Virginia House of Delegates; later became Governor of Virginia in 1825 and was elected U.S. Senator in 1827.",
      },
      {
        "James K. Polk":
          "Practicing law in Tennessee; served in the Tennessee House of Representatives (elected in 1823); began aligning with Jacksonian Democrats.",
      },
      {
        "William Henry Harrison":
          "Largely retired from public service during these years; focused on his farm in Ohio but remained a respected figure; served in the Ohio State Senate starting in 1825.",
      },
    ],
  },
  {
    name: "Andrew Jackson",
    terms: 2,
    status: "dead",
    birthYear: 1767,
    birthPlace: "Waxhaws region, South Carolina/North Carolina",
    parents: "Andrew Jackson Sr. and Elizabeth Hutchinson Jackson",
    deathYear: 1845,
    deathPlace: "Nashville, Tennessee",
    deathReason: "Tuberculosis and natural causes",
    presidencyStart: 1829,
    presidencyEnd: 1837,
    keyPolicies: 10,
    policies: [
      "Indian Removal Act (1830) : Forced Native American tribes to relocate west of the Mississippi River, leading to the Trail of Tears.",
      "Nullification Crisis (1832-1833) : Confronted South Carolina’s attempt to nullify federal tariffs, reinforcing federal authority and preventing secession.",
      "Bank War (1832) : Vetoed the renewal of the Second Bank of the United States, leading to its dissolution and shifting federal funds to state banks (pet banks).",
      "Specie Circular (1836) : Required government land purchases to be made in gold or silver instead of paper money, contributing to the Panic of 1837.",
      "Creation of the Democratic Party : Established the Democratic Party as a major political force, representing the interests of the common man.",
      "Maysville Road Veto (1830) : Vetoed a bill funding a Kentucky road project, arguing that infrastructure projects should be funded by states rather than the federal government.",
      "Peggy Eaton Affair : A social and political scandal that influenced Jackson’s cabinet reshuffling and loyalty among his advisors.",
      "Force Bill (1833) : Authorized Jackson to use military force to ensure compliance with federal tariff laws in response to the Nullification Crisis.",
      "Expansion of Executive Power : Strengthened the presidency by using the veto power more than all previous presidents combined, reshaping the balance of power in government.",
      "Panic of 1837 : Although it occurred shortly after his presidency, Jackson’s financial policies, including the Bank War and Specie Circular, contributed to the economic downturn.",
    ],
    party: "Democratic",
    spouse: "Rachel Donelson Robards Jackson",
    children: "None",
    occupationBeforePresidency: "Lawyer and Military Leader",
    quote: "One man with courage makes a majority.",
    image: "images/AndrewJackson.png",
    otherPresidents: [
      "John Quincy Adams",
      "Martin Van Buren",
      "John Tyler",
      "James K. Polk",
      "William Henry Harrison",
    ],
    otherPresidentThings: [
      {
        "John Quincy Adams":
          "Returned to public service as a U.S. Representative from Massachusetts (1831–1848); became a strong opponent of slavery and critic of Jackson’s policies, especially on internal improvements and the gag rule.",
      },
      {
        "Martin Van Buren":
          "Served as Jackson’s Secretary of State (1829–1831), then Vice President (1833–1837); became Jackson’s trusted advisor and handpicked successor.",
      },
      {
        "John Tyler":
          "Served as U.S. Senator from Virginia (until 1836); opposed many Jacksonian policies, including the national bank veto; began aligning with the Whig Party.",
      },
      {
        "James K. Polk":
          "Served in the U.S. House of Representatives (1825–1839); became a strong Jackson ally and chaired the Ways and Means Committee; Speaker of the House in 1835.",
      },
      {
        "William Henry Harrison":
          "Re-emerged in politics as a Whig presidential candidate in 1836 (unsuccessfully); campaigned on military record and opposition to Jacksonian policies.",
      },
    ],
  },
  {
    name: "Martin Van Buren",
    status: "dead",
    birthYear: 1782,
    birthPlace: "Kinderhook, New York",
    parents: "Abraham Van Buren and Maria Hoes",
    deathYear: 1862,
    deathPlace: "Kinderhook, New York",
    deathReason: "Pneumonia",
    presidencyStart: 1837,
    presidencyEnd: 1841,
    keyPolicies: 8,
    policies: [
      "Panic of 1837 : A severe economic depression that began shortly after Van Buren took office, caused by Jackson’s financial policies, land speculation, and the collapse of state banks.",
      "Independent Treasury Act (1840) : Established a system where federal funds would be stored in government vaults instead of private banks, aiming to stabilize the economy.",
      "Opposition to the Annexation of Texas : Refused to annex Texas, fearing it would lead to conflict with Mexico and intensify sectional tensions over slavery.",
      "Continuation of Indian Removal : Enforced the policies initiated under Andrew Jackson, including the forced relocation of Native American tribes such as the Cherokee.",
      "Neutrality in Canadian Rebellion (1837-1838) : Enforced strict neutrality when Canadian rebels sought U.S. support, preventing war with Britain.",
      "Enforcement of the Gag Rule : Supported a congressional rule that prevented discussions on anti-slavery petitions, reflecting his cautious stance on slavery.",
      "Amistad Case (1839) : His administration opposed granting freedom to enslaved Africans who had taken control of the Amistad ship, arguing they should be returned to Spain, though the Supreme Court later ruled in favor of their freedom.",
      "Expansion of Labor Rights : Supported the 10-hour workday for federal employees, an early step toward labor reform.",
    ],
    party: "Democratic",
    spouse: "Hannah Hoes Van Buren",
    children: "5",
    occupationBeforePresidency: "Lawyer and Politician",
    quote: "It is easier to do a job right than to explain why you didn’t.",
    image: "images/MartinVanBuren.png",
    otherPresidents: [
      "Andrew Jackson",
      "John Quincy Adams",
      "John Tyler",
      "James K. Polk",
      "William Henry Harrison",
    ],
    otherPresidentThings: [
      {
        "Andrew Jackson":
          "Retired to his plantation, The Hermitage, after leaving the presidency in 1837; remained politically active as an advisor and supporter of Van Buren’s administration.",
      },
      {
        "John Quincy Adams":
          "Continued serving in the U.S. House of Representatives; increasingly vocal against slavery and critical of Van Buren’s handling of abolitionist petitions (especially the gag rule).",
      },
      {
        "John Tyler":
          "Served as U.S. Senator from Virginia until 1836; after resigning, remained politically active as a Whig critic of Van Buren’s policies.",
      },
      {
        "James K. Polk":
          "Continued serving in the U.S. House of Representatives until 1839; strong supporter of Jacksonian Democrats and aligned with Van Buren on several policies.",
      },
      {
        "William Henry Harrison":
          "Ran as a Whig presidential candidate in 1836 (lost), but remained active; successfully ran against Van Buren in the 1840 election.",
      },
    ],
  },
  {
    name: "William Henry Harrison",
    status: "dead",
    birthYear: 1773,
    birthPlace: "Berkeley Plantation, Virginia",
    parents: "Benjamin Harrison V and Elizabeth Bassett Harrison",
    deathYear: 1841,
    deathPlace: "Washington, D.C.",
    deathReason: "Pneumonia",
    presidencyStart: 1841,
    presidencyEnd: 1841,
    keyPolicies: 5,
    policies: [
      "First Presidential Inauguration Speech (1841) : Delivered the longest inaugural address in U.S. history, emphasizing a strict interpretation of the Constitution and opposition to executive overreach.",
      "Whig Party Economic Agenda : Planned to implement the Whig Party's policies, including re-establishing a national bank and promoting infrastructure projects, though he died before enacting them.",
      "Limited Presidential Veto : Expressed opposition to excessive use of the presidential veto, aiming to restore Congressional authority over policymaking.",
      "Civil Service Reform Intentions : Planned to reduce the influence of the 'spoils system' by limiting political appointments to qualified individuals rather than party loyalists.",
      "Western Expansion Support : Supported policies favoring the settlement of western territories, continuing the expansionist vision of the U.S.",
    ],
    party: "Whig",
    spouse: "Anna Tuthill Symmes Harrison",
    children: "10",
    occupationBeforePresidency: "Military Officer and Politician",
    quote:
      "The liberties of a people depend on their own constant attention to its preservation.",
    notes: "Died only after 32 days in office.",
    image: "images/WilliamHenryHarrison.png",
    otherPresidents: [
      "Martin Van Buren",
      "Anrew Jackson",
      "John Quincy Adams",
      "John Tyler",
      "James K. Polk",
    ],
    otherPresidentThings: [
      {
        "Martin Van Buren":
          "Returned to private life after losing the 1840 election; remained politically active and began preparing for a potential comeback in 1844.",
      },
      {
        "Andrew Jackson":
          "In retirement at The Hermitage; maintained correspondence with political allies, including Van Buren; expressed concern about the rise of the Whig Party.",
      },
      {
        "John Quincy Adams":
          "Still serving in the U.S. House of Representatives; continued his anti-slavery advocacy and opposition to Southern influence in national politics.",
      },
      {
        "John Tyler":
          "Vice President under Harrison; became President after Harrison’s death on April 4, 1841 — the first time a vice president assumed the presidency due to death in office.",
      },
      {
        "James K. Polk":
          "Recently completed his term as Speaker of the House (1835–1839); served as Governor of Tennessee (1839–1841); preparing for national Democratic leadership.",
      },
    ],
  },
  {
    name: "John Tyler",
    status: "dead",
    birthYear: 1790,
    birthPlace: "Charles City County, Virginia",
    parents: "John Tyler Sr. and Mary Ball",
    deathYear: 1862,
    deathPlace: "Richmond, Virginia",
    deathReason: "Stroke",
    presidencyStart: 1841,
    presidencyEnd: 1845,
    keyPolicies: 10,
    policies: [
      "Annexation of Texas (1845) : Signed the resolution to annex Texas into the United States, which later led to tensions with Mexico and the Mexican-American War.",
      "Veto of National Bank Bills (1841) : Vetoed two bills proposed by the Whig Party to establish a new national bank, leading to his expulsion from the Whig Party.",
      "Webster-Ashburton Treaty (1842) : Settled border disputes between the U.S. and British Canada, particularly in Maine and Minnesota.",
      "Preemption Act of 1841 : Allowed squatters on federal lands to purchase the land before it was offered for sale to the public, encouraging westward expansion.",
      "Treaty of Wanghia (1844) : The first trade treaty between the U.S. and China, granting America 'most favored nation' status in trade relations.",
      "Dorr Rebellion Response (1842) : Refused to intervene in Rhode Island’s political crisis, affirming state control over its own electoral laws.",
      "Log Cabin Bill (1841) : Provided settlers with 160 acres of public land at low prices, further supporting western expansion.",
      "Opposition to Tariff of 1842 : Initially opposed, but later signed a higher protective tariff to increase government revenue.",
      "Strengthening the U.S. Navy : Expanded and modernized the U.S. Navy, particularly for international trade and protection of American interests.",
      "Failed Impeachment Attempt (1842) : Became the first U.S. president to face an impeachment resolution, though it did not pass in Congress.",
    ],
    party: "Whig",
    spouse: "Letitia Christian Tyler",
    children: "8",
    occupationBeforePresidency: "Lawyer and Politician",
    quote:
      "Wealth can only be accumulated by the earnings of industry and the savings of frugality.",
    note: "John Tyler, often called “His Accidency”, had a presidency marked by clashes with his own party, the Whigs, and a focus on expansionist policies. ",
    image: "images/JohnTyler.png",
    otherPresidents: [
      "William Henry Harrison",
      "Martin Van Buren",
      "Andrew Jackson",
      "John Quincy Adams",
      "James K. Polk",
      "Zachary Taylor",
    ],
    otherPresidentThings: [
      {
        "William Henry Harrison":
          "Deceased — died in office on April 4, 1841, just one month into his presidency. Tyler succeeded him as president.",
      },
      {
        "Martin Van Buren":
          "Largely retired from public life after his 1840 defeat; declined to actively campaign in 1844 but was later nominated by the Free Soil Party in 1848.",
      },
      {
        "Andrew Jackson":
          "In declining health but continued to advise Democratic leaders from The Hermitage; remained critical of Whig policies and Tyler’s break with the party.",
      },
      {
        "John Quincy Adams":
          "Served actively in the U.S. House of Representatives; continued to oppose slavery and the annexation of Texas, a major initiative of Tyler's presidency.",
      },
      {
        "James K. Polk":
          "Regained political influence in Tennessee after a gubernatorial loss; positioned himself as a dark horse candidate for the 1844 Democratic nomination, which he eventually won.",
      },
      {
        "Zachary Taylor":
          "Serving as a military commander on the southwestern frontier; began gaining national attention for leadership in conflicts near the Texas-Mexico border.",
      },
    ],
  },
  {
    name: "James K. Polk",
    status: "dead",
    birthYear: 1795,
    birthPlace: "Pineville, North Carolina",
    parents: "Samuel Polk and Jane Knox",
    deathYear: 1849,
    deathPlace: "Nashville, Tennessee",
    deathReason: "Cholera",
    presidencyStart: 1845,
    presidencyEnd: 1849,
    keyPolicies: 10,
    policies: [
      "Oregon Treaty (1846) : Established the northern boundary of the U.S. at the 49th parallel, securing Oregon Territory from Britain without conflict.",
      "Mexican-American War (1846-1848) : Led to the U.S. victory over Mexico, resulting in the acquisition of a vast territory in the Southwest.",
      "Treaty of Guadalupe Hidalgo (1848) : Ended the Mexican-American War and ceded California, Arizona, New Mexico, and other territories to the U.S.",
      "Annexation of Texas (1845) : Officially brought Texas into the Union, fulfilling Polk’s expansionist vision but increasing tensions with Mexico.",
      "Independent Treasury System (1846) : Re-established a system for managing government funds separately from private banks, ensuring financial stability.",
      "Walker Tariff (1846) : Lowered tariffs on imports, promoting free trade and benefiting Southern agricultural interests.",
      "Wilmot Proviso Debate (1846) : Though not passed, it proposed banning slavery in territories acquired from Mexico, sparking sectional tensions.",
      "Expansion of the U.S. Navy : Strengthened the U.S. Navy to support international trade and military actions.",
      "Smithsonian Institution Established (1846) : Signed into law the creation of the Smithsonian Institution, promoting education and research.",
      "California Gold Rush (1848) : Though not a direct policy, Polk’s acquisition of California set the stage for the Gold Rush and westward expansion.",
    ],
    party: "Democratic",
    spouse: "Sarah Childress Polk",
    children: "None",
    occupationBeforePresidency: "Lawyer",
    quote:
      "No president who performs his duties faithfully and conscientiously can have any leisure.",
    image: "images/JamesKPolk.png",
    otherPresidents: [
      "Martin Van Buren",
      "John Tyler",
      "Zachary Taylor",
      "Millard Fillmore",
      "Franklin Pierce",
      "James Buchanan",
      "Abraham Lincoln",
    ],
    otherPresidentThings: [
      {
        "Martin Van Buren":
          "Remained active in Democratic politics; sought the 1844 nomination but lost to Polk; later distanced himself from Polk’s expansionist policies and opposed the annexation of Texas.",
      },
      {
        "John Tyler":
          "Retired from public life after leaving office in 1845; supported the annexation of Texas, which Polk completed early in his term.",
      },
      {
        "John Quincy Adams":
          "Served in the U.S. House of Representatives until his death in 1848; opposed the Mexican-American War and slavery expansion; collapsed on the House floor and died shortly after.",
      },
      {
        "Zachary Taylor":
          "Gained national fame as a general in the Mexican-American War (1846–1848); his victories made him a popular hero and future Whig presidential candidate.",
      },
      {
        "Millard Fillmore":
          "Served in the U.S. House of Representatives (1833–1835, 1837–1843); though not holding national office during Polk’s term, he was active in New York politics and later became Taylor’s running mate in 1848.",
      },
      {
        "Franklin Pierce":
          "Served in the U.S. Senate until 1842; supported the Mexican-American War and remained active in Democratic Party politics; declined an offer to serve in Polk’s cabinet.",
      },
      {
        "James Buchanan":
          "Served as U.S. Secretary of State under Polk (1845–1849); played a major role in foreign policy including relations with Britain and negotiations over Oregon.",
      },
      {
        "Abraham Lincoln":
          "Elected to the U.S. House of Representatives in 1846; served one term (1847–1849); was a vocal Whig critic of the Mexican-American War and President Polk’s justifications for it.",
      },
    ],
  },
  {
    name: "Zachary Taylor",
    status: "dead",
    birthYear: 1784,
    birthPlace: "Barboursville, Virginia",
    parents: "Richard Taylor and Sarah Strother",
    deathYear: 1850,
    deathPlace: "Washington, D.C.",
    deathReason: "Gastroenteritis",
    presidencyStart: 1849,
    presidencyEnd: 1850,
    keyPolicies: 8,
    policies: [
      "Compromise of 1850 Opposition : Opposed the expansion of slavery into newly acquired territories, resisting efforts to pass the Compromise of 1850 during his presidency.",
      "California Statehood (1849) : Supported California’s bid for statehood as a free state, intensifying tensions between the North and South over slavery.",
      "Utah and New Mexico Territorial Governments : Advocated for the organization of Utah and New Mexico territories without immediate decisions on slavery, leaving the issue to local governance.",
      "Clayton-Bulwer Treaty (1850) : Signed a treaty with Britain that ensured neither country would colonize or control any future canal across Central America.",
      "Enforcement of Federal Authority : Threatened to use military force against Southern states considering secession over the slavery debate.",
      "Support for Infrastructure : Advocated for internal improvements such as roads and canals but took a limited federal approach to funding them.",
      "Relations with Native Americans : Continued previous policies of relocating Native American tribes to reservations to make way for westward expansion.",
      "Limited Government Spending : Promoted fiscal responsibility and opposed excessive federal expenditures.",
    ],
    party: "Whig",
    spouse: "Margaret Mackall Smith Taylor",
    children: "6",
    occupationBeforePresidency: "Military Officer",
    quote:
      "I have always done my duty. I am ready to die. My only regret is for the friends I leave behind me.",
    image: "images/ZacharyTaylor.png",
    otherPresidents: [
      "James K. Polk",
      "Martin Van Buren",
      "John Tyler",
      "Millard Fillmore",
      "Franklin Pierce",
      "James Buchanan",
      "Abraham Lincoln",
    ],
    otherPresidentThings: [
      {
        "James K. Polk":
          "Died just three months after leaving office in 1849; spent his final days in retirement in Nashville, Tennessee, following a physically exhausting presidency.",
      },
      {
        "Martin Van Buren":
          "Retired from national politics after his 1848 Free Soil Party presidential run; remained a respected elder statesman, though largely removed from public affairs.",
      },
      {
        "John Tyler":
          "In retirement at his Virginia plantation, Sherwood Forest; remained politically engaged and would later support secessionist causes in the 1850s.",
      },
      {
        "Millard Fillmore":
          "Vice President under Taylor; became President upon Taylor’s death in July 1850.",
      },
      {
        "Franklin Pierce":
          "Served as U.S. Attorney for New Hampshire; maintained low national political profile during this period but stayed active in Democratic Party affairs.",
      },
      {
        "James Buchanan":
          "Returned to private legal practice in Pennsylvania after serving as Secretary of State; preparing for a political comeback that would lead to his 1856 presidential run.",
      },
      {
        "Abraham Lincoln":
          "Returned to Illinois law practice after serving one term in the U.S. House (1847–1849); largely disengaged from national politics during Taylor's presidency.",
      },
    ],
  },
  {
    name: "Millard Fillmore",
    status: "dead",
    birthYear: 1800,
    birthPlace: "Summerhill, New York",
    parents: "Nathaniel Fillmore and Phoebe Millard",
    deathYear: 1874,
    deathPlace: "Buffalo, New York",
    deathReason: "Stroke",
    presidencyStart: 1850,
    presidencyEnd: 1853,
    keyPolicies: 8,
    policies: [
      "Compromise of 1850 : Signed into law a series of bills that attempted to ease tensions between free and slave states, including the admission of California as a free state and the Fugitive Slave Act.",
      "Fugitive Slave Act (1850) : Enforced stricter laws requiring the return of escaped enslaved individuals, angering Northern abolitionists.",
      "Texas-New Mexico Boundary Act (1850) : Resolved the border dispute between Texas and New Mexico, giving federal government control over the disputed land.",
      "Abolition of the Slave Trade in Washington, D.C. (1850) : As part of the Compromise of 1850, ended the slave trade (but not slavery) in the nation’s capital.",
      "Expansion of Trade with Japan : Sent Commodore Matthew Perry to open trade relations with Japan, leading to the Treaty of Kanagawa in 1854.",
      "Support for the Transcontinental Railroad : Pushed for infrastructure improvements, including early efforts toward a transcontinental railroad.",
      "Enforcement of Federal Authority : Used federal power to maintain law and order, including suppressing secessionist movements.",
      "Cuba Annexation Attempt (Lopez Expeditions) : Took a neutral stance while some Americans attempted to annex Cuba, an effort that ultimately failed.",
    ],
    party: "Whig",
    spouse: "Abigail Powers Fillmore",
    children: "2",
    occupationBeforePresidency: "Lawyer",
    quote:
      "The nourishment of a nation depends on the health of its democracy.",
    image: "images/MillardFillmore.png",
    otherPresidents: [
      "Zachary Taylor",
      "Martin Van Buren",
      "John Tyler",
      "Franklin Pierce",
      "James Buchanan",
      "Abraham Lincoln",
    ],
    otherPresidentThings: [
      {
        "Zachary Taylor":
          "Deceased — died in office on July 9, 1850, after only 16 months as president. Fillmore succeeded him and completed the remainder of the term.",
      },
      {
        "Martin Van Buren":
          "In retirement in Kinderhook, New York; largely withdrawn from public life after his 1848 Free Soil Party run; occasionally corresponded with political figures.",
      },
      {
        "John Tyler":
          "Retired in Virginia but remained politically engaged; increasingly aligned with pro-slavery and Southern interests; voiced support for states' rights.",
      },
      {
        "Franklin Pierce":
          "Regained national attention as a potential Democratic presidential candidate; had returned to private life but was building party alliances behind the scenes.",
      },
      {
        "James Buchanan":
          "Active in Democratic Party politics; was a top contender for the 1852 Democratic nomination but lost to Pierce; continued promoting national unity and compromise on slavery.",
      },
      {
        "Abraham Lincoln":
          "Practicing law in Illinois; remained politically quiet during Fillmore's term, having stepped away from national office after his House term ended in 1849.",
      },
    ],
  },
  {
    name: "Franklin Pierce",
    status: "dead",
    birthYear: 1804,
    birthPlace: "Hillsborough, New Hampshire",
    parents: "Benjamin Pierce and Anna Kendrick",
    deathYear: 1869,
    deathPlace: "Concord, New Hampshire",
    deathReason: "Pneumonia",
    presidencyStart: 1853,
    presidencyEnd: 1857,
    keyPolicies: 8,
    policies: [
      "Kansas-Nebraska Act (1854) : Repealed the Missouri Compromise and allowed settlers in Kansas and Nebraska to determine the status of slavery, leading to violent conflicts known as 'Bleeding Kansas.'",
      "Gadsden Purchase (1854) : Acquired land from Mexico (southern Arizona and southwestern New Mexico) to facilitate the construction of a southern transcontinental railroad.",
      "Enforcement of the Fugitive Slave Act : Strictly enforced laws requiring the return of escaped enslaved individuals, increasing tensions between the North and South.",
      "Expansion of Trade with Japan : Supported the success of Commodore Matthew Perry’s expedition, leading to the Treaty of Kanagawa (1854), opening Japan to U.S. trade.",
      "Ostend Manifesto (1854) : Secretly supported an unsuccessful attempt to purchase or seize Cuba from Spain to expand slavery, leading to controversy when it was exposed.",
      "Diplomatic Relations with Latin America : Worked to expand U.S. influence in Central and South America, including attempts to acquire more territory.",
      "Economic Growth Policies : Encouraged infrastructure expansion, including railroad development, to promote westward expansion and commerce.",
      "Civil Service Appointments Based on Party Loyalty : Strengthened the 'spoils system' by rewarding government positions to loyal Democrats, leading to political corruption.",
    ],
    party: "Democratic",
    spouse: "Jane Means Appleton Pierce",
    children: "3",
    occupationBeforePresidency: "Lawyer and Politician",
    quote:
      "The storm of frenzy and faction must inevitably dash itself in vain against the unshaken rock of the Constitution.",
    image: "images/FranklinPierce.png",
    otherPresidents: [
      "Millard Fillmore",
      "John Tyler",
      "James Buchanan",
      "Abraham Lincoln",
      "James K. Polk",
      "Zachary Taylor",
      "Martin Van Buren",
    ],
    otherPresidentThings: [
      {
        "Millard Fillmore":
          "Returned to private life in New York after completing Taylor’s term; remained politically active, later ran as the Know-Nothing (American Party) candidate in the 1856 presidential election.",
      },
      {
        "John Tyler":
          "Continued his retirement in Virginia; became increasingly aligned with Southern secessionist sentiment; would eventually support the Confederacy.",
      },
      {
        "James Buchanan":
          "Served as U.S. Minister to the United Kingdom (1853–1856), where he helped negotiate the controversial Ostend Manifesto advocating for the acquisition of Cuba.",
      },
      {
        "Abraham Lincoln":
          "Practiced law in Illinois; re-entered the political scene by speaking out against the Kansas-Nebraska Act (1854), which Pierce had signed, helping to galvanize anti-slavery Whigs and form the Republican Party.",
      },
      {
        "James K. Polk":
          "Deceased — died in 1849 shortly after leaving office.",
      },
      {
        "Zachary Taylor": "Deceased — died in office in 1850.",
      },
      {
        "Martin Van Buren":
          "In retirement, remained a respected elder statesman; publicly opposed the Kansas-Nebraska Act, viewing it as destabilizing to the Union.",
      },
    ],
  },
  {
    name: "James Buchanan",
    status: "dead",
    birthYear: 1791,
    birthPlace: "Cove Gap, Pennsylvania",
    parents: "James Buchanan Sr. and Elizabeth Speer",
    deathYear: 1868,
    deathPlace: "Lancaster, Pennsylvania",
    deathReason: "Pneumonia",
    presidencyStart: 1857,
    presidencyEnd: 1861,
    keyPolicies: 8,
    policies: [
      "Dred Scott Decision Support (1857) : Endorsed the Supreme Court’s ruling that African Americans were not citizens and that Congress could not prohibit slavery in the territories.",
      "Lecompton Constitution (1857) : Supported a pro-slavery constitution for Kansas statehood, despite opposition from anti-slavery settlers, worsening sectional tensions.",
      "Panic of 1857 : Responded weakly to a major economic downturn caused by land speculation and banking failures, disproportionately affecting the North.",
      "Utah War (1857-1858) : Sent federal troops to Utah to suppress a rebellion by Mormon settlers, though it was resolved peacefully.",
      "Ostend Manifesto Fallout : Continued expansionist goals to acquire Cuba but faced strong opposition after earlier diplomatic efforts were exposed and condemned.",
      "Crittenden Compromise Rejection (1860) : Declined to support a last-minute compromise that sought to prevent secession by allowing the expansion of slavery.",
      "Secession Crisis Inaction (1860-1861) : Failed to prevent Southern states from seceding after Lincoln’s election, arguing that the federal government had no authority to stop them.",
      "Strengthening of Fort Sumter : Refused to surrender federal forts to the Confederacy, indirectly setting the stage for the Civil War.",
    ],
    party: "Democratic",
    spouse: "None",
    children: "None",
    occupationBeforePresidency: "Diplomat and Lawyer",
    quote: "The ballot box is the surest arbiter of disputes among free men.",
    image: "images/JamesBuchanan.png",
    otherPresidents: [
      "Franklin Pierce",
      "Millard Fillmore",
      "John Tyler",
      "Abraham Lincoln",
      "Zachary Taylor",
      "James K. Polk",
      "Martin Van Buren",
    ],
    otherPresidentThings: [
      {
        "Franklin Pierce":
          "Retired from public life but continued to support Southern Democrats; opposed abolitionism and supported Buchanan’s pro-Southern policies like the enforcement of the Dred Scott decision.",
      },
      {
        "Millard Fillmore":
          "In retirement in Buffalo, New York; occasionally voiced moderate Unionist views but did not hold public office; remained critical of sectional extremism from both North and South.",
      },
      {
        "John Tyler":
          "Still retired in Virginia; continued to support states' rights and slavery; increasingly sympathetic to secessionist views as national tensions worsened.",
      },
      {
        "Abraham Lincoln":
          "Re-entered politics through debates with Stephen A. Douglas in 1858 (Lincoln-Douglas Debates); gained national prominence as a leading Republican voice against the expansion of slavery.",
      },
      {
        "Zachary Taylor": "Deceased — died in office in 1850.",
      },
      {
        "James K. Polk":
          "Deceased — died in 1849 shortly after his presidency ended.",
      },
      {
        "Martin Van Buren":
          "Deceased — died in 1862, but during Buchanan’s term, he remained retired and opposed to slavery expansion, including the Dred Scott decision.",
      },
    ],
  },
  {
    name: "Abraham Lincoln",
    status: "dead",
    birthYear: 1809,
    birthPlace: "Hodgenville, Kentucky",
    parents: "Thomas Lincoln and Nancy Hanks",
    deathYear: 1865,
    deathPlace: "Washington, D.C.",
    deathReason: "Assassination",
    presidencyStart: 1861,
    presidencyEnd: 1865,
    keyPolicies: 10,
    policies: [
      "Emancipation Proclamation (1863) : Declared all enslaved people in Confederate-held territories to be free, shifting the Civil War's focus to ending slavery.",
      "Homestead Act (1862) : Provided 160 acres of free public land to settlers who agreed to cultivate it for at least five years, promoting westward expansion.",
      "Pacific Railway Act (1862) : Authorized the construction of the Transcontinental Railroad, connecting the east and west coasts and boosting economic growth.",
      "Morrill Land-Grant Act (1862) : Granted federal land to states to establish agricultural and technical colleges, improving education and innovation.",
      "National Banking Act (1863) : Established a national banking system and uniform currency, stabilizing the U.S. economy during the Civil War.",
      "Suspension of Habeas Corpus (1861) : Temporarily suspended habeas corpus to arrest and detain suspected Confederate sympathizers without trial, increasing executive power.",
      "Ten-Percent Plan (1863) : Proposed a lenient Reconstruction policy that allowed Confederate states to rejoin the Union if 10% of voters swore loyalty to the U.S.",
      "13th Amendment (1865) : Pushed for the constitutional amendment that abolished slavery in the United States, ensuring a permanent end to the institution.",
      "Revenue Act of 1862 : Established the first progressive income tax to fund the Union war effort during the Civil War.",
      "Establishment of the U.S. Secret Service (1865) : Created the Secret Service on the day of his assassination, originally to combat counterfeiting but later expanded to protect the president.",
    ],
    party: "Republican",
    spouse: "Mary Todd Lincoln",
    children: "4",
    occupationBeforePresidency: "Lawyer",
    quote:
      "Government of the people, by the people, for the people, shall not perish from the Earth.",
    image: "images/AbrahamLincoln.png",
    otherPresidents: [
      "James Buchanan",
      "Franklin Pierce",
      "Millard Fillmore",
      "John Tyler",
      "James K. Polk",
      "Zachary Taylor",
      "Martin Van Buren",
      "Andrew Johnson",
    ],
    otherPresidentThings: [
      {
        "James Buchanan":
          "Retired from public life after leaving office in 1861; defended his administration’s inaction as secession unfolded; criticized Lincoln’s war policies but avoided public office or major influence.",
      },
      {
        "Franklin Pierce":
          "Lived in retirement in New Hampshire; privately expressed sympathy for the South and criticized Lincoln’s suspension of civil liberties; his pro-Southern views damaged his reputation.",
      },
      {
        "Millard Fillmore":
          "Also in retirement; supported the Union but opposed many of Lincoln’s wartime policies; advocated for a moderate peace but had limited public influence.",
      },
      {
        "John Tyler":
          "Joined the Confederate cause in 1861 and was elected to the Confederate House of Representatives; died in 1862 while serving the Confederacy.",
      },
      {
        "James K. Polk": "Deceased — died in 1849.",
      },
      {
        "Zachary Taylor": "Deceased — died in 1850.",
      },
      {
        "Martin Van Buren":
          "Deceased — died in July 1862, during Lincoln’s first term; had opposed slavery expansion and disapproved of the Civil War’s escalation.",
      },
      {
        "Andrew Johnson":
          "Served as U.S. Senator from Tennessee; remained loyal to the Union despite being from a Southern state; appointed military governor of Tennessee in 1862; chosen as Lincoln’s running mate in 1864.",
      },
    ],
  },
  {
    name: "Andrew Johnson",
    status: "dead",
    birthYear: 1808,
    birthPlace: "Raleigh, North Carolina",
    parents: "Mary (McDonough) Johnson and Jacob Johnson",
    deathYear: 1875,
    deathPlace: "Elizabethton, Tennessee",
    deathReason: "Stroke",
    presidencyStart: 1865,
    presidencyEnd: 1869,
    keyPolicies: 10,
    policies: [
      "Emancipation Proclamation (1863) : Declared all enslaved people in Confederate-held territories to be free, shifting the Civil War's focus to ending slavery.",
      "Homestead Act (1862) : Provided 160 acres of free public land to settlers who agreed to cultivate it for at least five years, promoting westward expansion.",
      "Pacific Railway Act (1862) : Authorized the construction of the Transcontinental Railroad, connecting the east and west coasts and boosting economic growth.",
      "Morrill Land-Grant Act (1862) : Granted federal land to states to establish agricultural and technical colleges, improving education and innovation.",
      "National Banking Act (1863) : Established a national banking system and uniform currency, stabilizing the U.S. economy during the Civil War.",
      "Suspension of Habeas Corpus (1861) : Temporarily suspended habeas corpus to arrest and detain suspected Confederate sympathizers without trial, increasing executive power.",
      "Ten-Percent Plan (1863) : Proposed a lenient Reconstruction policy that allowed Confederate states to rejoin the Union if 10% of voters swore loyalty to the U.S.",
      "13th Amendment (1865) : Pushed for the constitutional amendment that abolished slavery in the United States, ensuring a permanent end to the institution.",
      "Revenue Act of 1862 : Established the first progressive income tax to fund the Union war effort during the Civil War.",
      "Establishment of the U.S. Secret Service (1865) : Created the Secret Service on the day of his assassination, originally to combat counterfeiting but later expanded to protect the president.",
    ],
    party: "National Union",
    spouse: "Eliza McCardle Johnson",
    children: "5",
    occupationBeforePresidency: "Tailor and Politician",
    quote: "Honest conviction is my courage; the Constitution is my guide.",
    image: "images/AndrewJohnson.png",
    otherPresidents: [
      "Abraham Lincoln",
      "James Buchanan",
      "Franklin Pierce",
      "Millard Fillmore",
      "John Tyler",
      "Martin Van Buren",
      "Ulysses S. Grant",
      "Rutherford B. Hayes",
    ],
    otherPresidentThings: [
      {
        "Abraham Lincoln":
          "Deceased — assassinated on April 14, 1865, just days after the end of the Civil War. Johnson, as vice president, succeeded him the following day.",
      },
      {
        "James Buchanan":
          "In retirement in Pennsylvania until his death in 1868; publicly defended his own record but largely avoided commenting on Johnson's policies or the Reconstruction struggle.",
      },
      {
        "Franklin Pierce":
          "Deceased — died in 1869, the same year Johnson left office; had remained a critic of Republican policies, including Lincoln and later Johnson’s approaches to Reconstruction.",
      },
      {
        "Millard Fillmore":
          "Lived quietly in retirement; supported the Union during the Civil War but had minimal influence during Reconstruction; avoided direct comment on Johnson’s impeachment crisis.",
      },
      {
        "John Tyler":
          "Deceased — died in 1862 after joining the Confederate Congress.",
      },
      {
        "Martin Van Buren": "Deceased — died in 1862 during the Civil War.",
      },
      {
        "Ulysses S. Grant":
          "Commanding General of the U.S. Army; oversaw military enforcement of Reconstruction policies; increasingly at odds with Johnson’s leniency toward the South; elected president in 1868.",
      },
      {
        "Rutherford B. Hayes":
          "Served as a Union general during the Civil War; elected to U.S. House of Representatives in 1865; began establishing a reputation as a moderate Republican.",
      },
    ],
  },
  {
    name: "Ulysses S. Grant",
    terms: 2,
    status: "dead",
    birthYear: 1822,
    birthPlace: "Point Pleasant, Ohio",
    parents: "Jesse Grant and Hannah Simpson",
    deathYear: 1885,
    deathPlace: "Wilton, New York",
    deathReason: "Cancer of the throat",
    presidencyStart: 1869,
    presidencyEnd: 1877,
    keyPolicies: 12,
    policies: [
      "15th Amendment (1870) : Ensured voting rights for African American men by prohibiting racial discrimination in voting.",
      "Enforcement Acts (1870-1871) : Passed laws to combat the Ku Klux Klan and protect African Americans' civil rights in the South during Reconstruction.",
      "Civil Rights Act of 1875 : Prohibited racial discrimination in public accommodations, though later struck down by the Supreme Court.",
      "Panic of 1873 : Responded to an economic depression caused by over-speculation in railroads and banking failures, leading to financial hardship across the U.S.",
      "Resumption Act of 1875 : Established the plan to return the U.S. to the gold standard, ensuring the redemption of paper currency in gold.",
      "Indian Peace Policy (1869) : Aimed to assimilate Native Americans into American society while reducing military conflicts, though it resulted in forced relocation and cultural suppression.",
      "Battle of Little Bighorn Aftermath (1876) : Oversaw federal responses to conflicts with Native American tribes, particularly after Custer’s defeat in Montana.",
      "Alabama Claims Settlement (1871) : Negotiated a treaty with Britain, securing $15.5 million in damages for British-built Confederate ships during the Civil War.",
      "Annexation of Santo Domingo Attempt (1869) : Attempted to annex Santo Domingo (now the Dominican Republic) to expand U.S. influence, though it was rejected by Congress.",
      "Reform of the Civil Service : Implemented early civil service reforms by introducing merit-based appointments and reducing the spoils system.",
      "Whiskey Ring Scandal (1875) : Exposed a major tax fraud scheme involving government officials and distillers, leading to criminal prosecutions.",
      "Transcontinental Railroad Completion (1869) : Promoted the continued expansion of railroads, linking the East and West coasts and fostering economic growth.",
    ],
    party: "Republican",
    spouse: "Julia Dent Grant",
    children: "4",
    occupationBeforePresidency: "Military Leader",
    quote: "The friend in my adversity I shall always cherish most.",
    image: "images/UlyssesGrant.png",
    otherPresidents: [
      "Andrew Johnson",
      "Abraham Lincoln",
      "James Buchanan",
      "Franklin Pierce",
      "Millard Fillmore",
      "Rutherford B. Hayes",
      "James A. Garfield",
      "Chester A. Arthur",
    ],
    otherPresidentThings: [
      {
        "Andrew Johnson":
          "Returned to Tennessee after leaving office; remained a vocal critic of Republican Reconstruction policies and Grant’s administration; briefly re-entered politics as a U.S. Senator from Tennessee in 1875 before dying in 1875.",
      },
      {
        "Abraham Lincoln":
          "Deceased — assassinated in 1865 shortly after the Civil War’s end.",
      },
      {
        "James Buchanan":
          "Deceased — died in 1868, a year before Grant took office.",
      },
      {
        "Franklin Pierce":
          "Deceased — died in 1869, the year Grant became president.",
      },
      {
        "Millard Fillmore":
          "Lived in quiet retirement in Buffalo, New York; had little public role and avoided involvement in postwar politics; died in 1874 during Grant’s second term.",
      },
      {
        "Rutherford B. Hayes":
          "Served as Governor of Ohio (1868–1872, 1876–1877); became a rising star in the Republican Party and was nominated and elected as Grant’s successor in 1876.",
      },
      {
        "James A. Garfield":
          "Served in the U.S. House of Representatives throughout Grant’s presidency; gained influence as a leading Republican legislator, especially on financial and civil service issues.",
      },
      {
        "Chester A. Arthur":
          "Practiced law and held minor political appointments in New York; became politically active in Republican machine politics, notably aligned with Senator Roscoe Conkling during the Grant era.",
      },
    ],
  },
  {
    name: "Rutherford B. Hayes",
    status: "dead",
    birthYear: 1822,
    birthPlace: "Delaware, Ohio",
    parents: "Rutherford Hayes Sr. and Sophia Birchard",
    deathYear: 1893,
    deathPlace: "Fremont, Ohio",
    deathReason: "Heart failure",
    presidencyStart: 1877,
    presidencyEnd: 1881,
    keyPolicies: 8,
    policies: [
      "Compromise of 1877 : Agreed to withdraw federal troops from the South in exchange for winning the disputed 1876 election, effectively ending Reconstruction.",
      "End of Reconstruction (1877) : Removed federal troops from Southern states, leading to the rise of Jim Crow laws and the disenfranchisement of African Americans.",
      "Civil Service Reform : Began reforming government jobs by pushing for merit-based appointments instead of political patronage (spoils system).",
      "Great Railroad Strike of 1877 : Sent federal troops to break up the nationwide railroad strike, marking one of the first major labor conflicts in U.S. history.",
      "Bland-Allison Act (1878) : Allowed the U.S. Treasury to purchase silver and coin it into dollars, aiming to help farmers and debtors but with limited economic impact.",
      "Indian Policy Reform : Advocated for Native American assimilation policies, including English-language education and land allotment programs.",
      "Voting Rights Protection : Urged Congress to protect Black voting rights in the South, though with little success due to Democratic opposition.",
      "Expansion of Education : Promoted federal aid for universal education, particularly in the South, but failed to pass significant legislation.",
    ],
    party: "Republican",
    spouse: "Lucy Webb Hayes",
    children: "8",
    occupationBeforePresidency: "Lawyer and Politician",
    quote: "He serves his party best who serves the country best.",
    image: "images/RutherfordHayes.png",
    otherPresidents: [
      "Ulysses S. Grant",
      "Andrew Johnson",
      "Abraham Lincoln",
      "Millard Fillmore",
      "James A. Garfield",
      "Chester A. Arthur",
      "Benjamin Harrison",
      "Grover Cleveland",
    ],
    otherPresidentThings: [
      {
        "Ulysses S. Grant":
          "Retired from the presidency in 1877; traveled extensively abroad on a world tour; remained a respected national figure and contemplated a political comeback in 1880 but was not re-nominated.",
      },
      {
        "Andrew Johnson":
          "Deceased — died in 1875 after briefly returning to the U.S. Senate.",
      },
      {
        "Abraham Lincoln": "Deceased — assassinated in 1865.",
      },
      {
        "Millard Fillmore": "Deceased — died in 1874.",
      },
      {
        "James A. Garfield":
          "Served in the U.S. House of Representatives; prominent Republican legislator known for his oratory and leadership on fiscal matters; elected president in 1880, succeeding Hayes.",
      },
      {
        "Chester A. Arthur":
          "Held the post of Collector of the Port of New York until removed by Hayes in 1878 as part of civil service reform; became a symbol of party patronage politics.",
      },
      {
        "Benjamin Harrison":
          "Practiced law in Indiana and served as a political leader within the state Republican Party; gained national attention during this period but did not yet hold high federal office.",
      },
      {
        "Grover Cleveland":
          "Practicing law in Buffalo, New York; served as Assistant District Attorney of Erie County and began building a reputation for integrity in local politics.",
      },
    ],
  },
  {
    name: "James A. Garfield",
    status: "dead",
    birthYear: 1831,
    birthPlace: "Moreland Hills, Ohio",
    parents: "Abigail (Ballou) Garfield and Eliza (Tanner) Garfield",
    deathYear: 1881,
    deathPlace: "Elberon, New Jersey",
    deathReason: "Assassination",
    presidencyStart: 1881,
    presidencyEnd: 1881,
    keyPolicies: 8,
    policies: [
      "Civil Service Reform Advocacy : Pushed for merit-based government jobs and opposed the spoils system, laying the groundwork for future reforms.",
      "Pendleton Civil Service Reform Act Proposal : Although passed after his assassination, his efforts led to the law, which introduced merit-based hiring for federal jobs.",
      "Strengthening Presidential Authority : Asserted executive power by resisting pressure from party leaders and refusing to grant patronage positions to political allies.",
      "Naval Expansion Plans : Advocated for modernizing and expanding the U.S. Navy to improve national defense and trade security.",
      "Support for Universal Education : Called for increased federal funding for public schools, particularly in the South, to reduce illiteracy and economic disparity.",
      "African American Civil Rights Support : Pushed for stronger federal protections for Black Americans' voting rights, though Congress did not act on his proposals.",
      "Tariff Reform : Sought to reduce tariffs that benefited industrialists at the expense of consumers, but his plans remained unfulfilled due to his short presidency.",
      "Economic Modernization : Supported industrial growth and infrastructure improvements, including railroad expansion, to boost the economy.",
    ],
    party: "Republican",
    spouse: "Lucretia Rudolph Garfield",
    children: "7",
    occupationBeforePresidency: "Military Leader and Politician",
    quote: "Ideas control the world.",
    image: "images/JamesGarfield.png",
    otherPresidents: [
      "Rutherford B. Hayes",
      "Ulysses S. Grant",
      "Chester A. Arthur",
      "Benjamin Harrison",
      "Grover Cleveland",
      "Abraham Lincoln",
      "Andrew Johnson",
      "Millard Fillmore",
    ],
    otherPresidentThings: [
      {
        "Rutherford B. Hayes":
          "In retirement after leaving office in March 1881; focused on promoting education and civil service reform from his home in Ohio; supported Garfield’s reform-minded agenda.",
      },
      {
        "Ulysses S. Grant":
          "Returned from his world tour in 1879; published his memoirs and was battling cancer; remained a revered Civil War hero until his death in 1885.",
      },
      {
        "Chester A. Arthur":
          "Vice President under Garfield; largely sidelined during Garfield’s short presidency but became president after Garfield’s death in September 1881.",
      },
      {
        "Benjamin Harrison":
          "Gaining influence in Indiana Republican politics; served as U.S. Senator (1881–1887); focused on veterans' affairs and civil service issues during Garfield’s presidency.",
      },
      {
        "Grover Cleveland":
          "Elected Mayor of Buffalo, New York in 1881; gaining attention for fighting corruption and political patronage at the local level.",
      },
      {
        "Abraham Lincoln": "Deceased — assassinated in 1865.",
      },
      {
        "Andrew Johnson": "Deceased — died in 1875.",
      },
      {
        "Millard Fillmore": "Deceased — died in 1874.",
      },
    ],
  },
  {
    name: "Chester A. Arthur",
    status: "dead",
    birthYear: 1829,
    birthPlace: "Fairfield, Vermont",
    parents: "William Arthur and Malvina Stone",
    deathYear: 1886,
    deathPlace: "New York City, New York",
    deathReason: "Stroke",
    presidencyStart: 1881,
    presidencyEnd: 1885,
    keyPolicies: 8,
    policies: [
      "Pendleton Civil Service Reform Act (1883) : Established the Civil Service Commission and introduced merit-based hiring, reducing the spoils system.",
      "Chinese Exclusion Act (1882) : Signed the first significant U.S. law restricting immigration, banning Chinese laborers from entering the country for ten years.",
      "Tariff Reduction Efforts : Advocated for lowering high tariffs to reduce surplus government revenue, though Congress was reluctant to act.",
      "Modernization of the U.S. Navy : Supported the expansion and modernization of the Navy by funding the construction of steel warships.",
      "Edmunds Act (1882) : Strengthened anti-polygamy laws against the Mormon Church in Utah, restricting polygamists' rights to vote and hold office.",
      "Rebuilding the Executive Mansion (White House) : Oversaw major renovations to the White House, improving its structure and furnishings.",
      "Indian Policy and Land Reform : Enforced policies aimed at assimilating Native Americans, including the idea of private land ownership through allotment.",
      "Veto of Rivers and Harbors Act (1882) : Vetoed a bill with excessive federal spending on infrastructure, arguing against wasteful government expenditures.",
    ],
    party: "Republican",
    spouse: "Ellen Lewis Herndon Arthur",
    children: "3",
    occupationBeforePresidency: "Lawyer",
    quote:
      "Men may die, but the fabric of our free institutions remains unshaken.",
    image: "images/ChesterArthur.png",
    otherPresidents: [
      "James A. Garfield",
      "Rutherford B. Hayes",
      "Ulysses S. Grant",
      "Benjamin Harrison",
      "Grover Cleveland",
      "Abraham Lincoln",
      "Andrew Johnson",
      "Millard Fillmore",
    ],
    otherPresidentThings: [
      {
        "James A. Garfield":
          "Deceased — died on September 19, 1881, after being shot earlier that summer. Arthur succeeded him as president.",
      },
      {
        "Rutherford B. Hayes":
          "In retirement in Ohio; continued advocating for civil service reform and praised Arthur for signing the Pendleton Civil Service Reform Act in 1883.",
      },
      {
        "Ulysses S. Grant":
          "Battling terminal illness; focused on writing his memoirs to provide financial support for his family; died in 1885 shortly after Arthur’s term ended.",
      },
      {
        "Benjamin Harrison":
          "Served as U.S. Senator from Indiana (1881–1887); active voice on veterans’ pensions, tariffs, and civil rights; gaining national profile for future presidential bid.",
      },
      {
        "Grover Cleveland":
          "Served as Mayor of Buffalo (1882) and was elected Governor of New York (1883); gained national recognition for anti-corruption efforts and fiscal conservatism.",
      },
      {
        "Abraham Lincoln": "Deceased — assassinated in 1865.",
      },
      {
        "Andrew Johnson": "Deceased — died in 1875.",
      },
      {
        "Millard Fillmore": "Deceased — died in 1874.",
      },
    ],
  },
  {
    name: "Grover Cleveland",
    status: "dead",
    birthYear: 1837,
    birthPlace: "Caldwell, New Jersey",
    parents: "Richard Falley Cleveland and Ann Neal Cleveland",
    deathYear: 1908,
    deathPlace: "Princeton, New Jersey",
    deathReason: "Heart failure",
    presidencyStart: 1885,
    presidencyEnd: 1889,
    keyPolicies: 16,
    policies: [
      "Interstate Commerce Act (1887) : Established the Interstate Commerce Commission (ICC) to regulate railroad rates and prevent unfair business practices.",
      "Veto of Pension Bills : Rejected numerous Civil War veteran pension bills that he believed were fraudulent or excessive, promoting fiscal responsibility.",
      "Dawes Act (1887) : Supported legislation that aimed to assimilate Native Americans by allotting them individual landholdings, ultimately leading to the loss of tribal lands.",
      "Presidential Vetoes (Over 300 Vetoes) : Used his veto power extensively to block unnecessary federal spending, especially on private pension bills.",
      "Civil Service Reform Enforcement : Continued enforcing the Pendleton Civil Service Act by expanding merit-based government hiring and reducing political patronage.",
      "Investigation of Railroad Land Grants : Ordered the return of millions of acres of land given to railroads that failed to meet government conditions.",
      "Opposition to High Tariffs : Pushed for **lower tariffs** on imported goods, arguing that high duties benefited big businesses at the expense of consumers.",
      "Naval Expansion : Modernized and expanded the U.S. Navy, continuing the transition from wooden ships to steel warships.",
      "Pullman Strike Response (1894) : Sent federal troops to break up a nationwide railroad strike, citing the need to protect mail delivery and interstate commerce.",
      "Panic of 1893 Response : Opposed government intervention in the economy and repealed the Sherman Silver Purchase Act, worsening the Depression for farmers and workers.",
      "Gold Standard Commitment : Opposed the free coinage of silver and maintained the U.S. commitment to the gold standard to ensure financial stability.",
      "Repeal of the Sherman Silver Purchase Act (1893) : Ended the requirement for the government to purchase silver, aiming to stabilize the economy during the Panic of 1893.",
      "Wilson-Gorman Tariff Act (1894) : Attempted to reduce tariffs, but Congress added a controversial income tax provision, later ruled unconstitutional.",
      "Opposition to Imperialism : Rejected the annexation of Hawaii after American businessmen overthrew the Hawaiian monarchy, arguing that it was an unjust act.",
      "Civil Service Reform Expansion : Continued his fight against political corruption by further strengthening merit-based government hiring.",
      "Labor Rights & Anti-Union Stance : Opposed government favoritism toward labor unions and used federal power against strikes.",
    ],

    party: "Democratic",
    spouse: "Frances Folsom Cleveland",
    children: "5",
    occupationBeforePresidency: "Lawyer and Politician",
    quote:
      "A government for the people must depend for its success on the intelligence, the morality, the justice, and the interest of the people themselves.",
    image: "images/GroverCleveland.png",
    otherPresidents: [
      "Chester A. Arthur",
      "James A. Garfield",
      "Rutherford B. Hayes",
      "Ulysses S. Grant",
      "Benjamin Harrison",
      "William McKinley",
      "Theodore Roosevelt",
    ],
    otherPresidentThings: [
      {
        "Chester A. Arthur":
          "In poor health and retired from public life after leaving office in 1885; died in 1886, just a year into Cleveland’s presidency.",
      },
      {
        "James A. Garfield": "Deceased — assassinated in 1881.",
      },
      {
        "Rutherford B. Hayes":
          "In retirement in Ohio; advocated for education and civil service reform; supported temperance and moral reform movements until his death in 1893.",
      },
      {
        "Ulysses S. Grant":
          "Deceased — died in July 1885, just months after Cleveland took office; widely honored for his military and presidential legacy.",
      },
      {
        "Benjamin Harrison":
          "Returned to Indiana after serving in the U.S. Senate; campaigned for Republican candidates and was nominated for president in 1888 to run against Cleveland.",
      },
      {
        "William McKinley":
          "Served as a U.S. Congressman from Ohio; rising star in Republican Party; known for advocacy of protective tariffs and opposition to Cleveland’s tariff reduction efforts.",
      },
      {
        "Theodore Roosevelt":
          "Elected to the New York State Assembly; gained a reputation as a reformer and outspoken young Republican; later appointed to the U.S. Civil Service Commission in 1889.",
      },
    ],
  },
  {
    name: "Benjamin Harrison",
    status: "dead",
    birthYear: 1833,
    birthPlace: "North Bend, Ohio",
    parents: "John Scott Harrison and Elizabeth Ramsey Irwin",
    deathYear: 1901,
    deathPlace: "Indianapolis, Indiana",
    deathReason: "Pneumonia",
    presidencyStart: 1889,
    presidencyEnd: 1893,
    keyPolicies: 8,
    policies: [
      "Sherman Antitrust Act (1890) : First federal law to prevent monopolies and anti-competitive business practices, laying the foundation for future antitrust regulations.",
      "McKinley Tariff (1890) : Raised tariffs on imported goods to protect American industries, but it also increased consumer prices and was unpopular among farmers.",
      "Dependent and Disability Pension Act (1890) : Expanded pensions for Civil War veterans and their families, significantly increasing federal spending.",
      "Sherman Silver Purchase Act (1890) : Required the U.S. government to buy more silver to boost the economy, but it contributed to economic instability.",
      "Admission of Six New States (1889-1890) : Oversaw the addition of North Dakota, South Dakota, Montana, Washington, Idaho, and Wyoming to the Union.",
      "Foreign Policy Expansion : Strengthened the U.S. Navy and promoted American influence in Latin America and the Pacific.",
      "Battle for Voting Rights : Advocated for federal protection of African American voting rights in the South, though Congress failed to pass meaningful legislation.",
      "Electricity Installed in the White House (1891) : Introduced electric lighting to the White House, though Harrison and his wife were reportedly afraid of using the light switches.",
    ],
    party: "Republican",
    spouse: "Caroline Lavinia Scott Harrison",
    children: "1",
    occupationBeforePresidency: "Lawyer and Politician",
    quote: "Great lives never go out; they go on.",
    image: "images/BenjaminHarrison.png",
    otherPresidents: [
      "Grover Cleveland",
      "Chester A. Arthur",
      "James A. Garfield",
      "Rutherford B. Hayes",
      "William McKinley",
      "Theodore Roosevelt",
    ],
    otherPresidentThings: [
      {
        "Grover Cleveland":
          "In private life after losing the 1888 election; lived in New York City and remained publicly silent but politically observant; prepared for a potential comeback and was re-nominated by Democrats in 1892.",
      },
      {
        "Chester A. Arthur": "Deceased — died in 1886.",
      },
      {
        "James A. Garfield": "Deceased — assassinated in 1881.",
      },
      {
        "Rutherford B. Hayes":
          "Lived in retirement in Ohio; continued promoting civil service reform and educational initiatives; died in 1893, shortly after Harrison’s term ended.",
      },
      {
        "William McKinley":
          "Served in the U.S. House of Representatives until 1891; then elected Governor of Ohio in 1891; emerged as a leading voice for protective tariffs and Republican policy.",
      },
      {
        "Theodore Roosevelt":
          "Appointed to the U.S. Civil Service Commission by Harrison in 1889; became nationally known for advocating civil service reform and fighting political corruption.",
      },
    ],
  },
  {
    name: "William McKinley",
    status: "dead",
    birthYear: 1843,
    birthPlace: "Niles, Ohio",
    parents: "William McKinley Sr. and Nancy Allison McKinley",
    deathYear: 1901,
    deathPlace: "Buffalo, New York",
    deathReason: "Assassination",
    presidencyStart: 1897,
    presidencyEnd: 1901,
    keyPolicies: 11,
    policies: [
      "Dingley Tariff Act (1897) : Raised tariffs to protect American industries, making it one of the highest tariff rates in U.S. history.",
      "Gold Standard Act (1900) : Officially put the U.S. on the gold standard, stabilizing the currency and ending the free silver debate.",
      "Annexation of Hawaii (1898) : Brought Hawaii into the U.S. as a territory, expanding American influence in the Pacific.",
      "Spanish-American War (1898) : Led the U.S. to victory against Spain, resulting in territorial acquisitions in the Caribbean and Pacific.",
      "Treaty of Paris (1898) : Ended the Spanish-American War, giving the U.S. control over Puerto Rico, Guam, and the Philippines.",
      "Platt Amendment (1901) : Established U.S. control over Cuba's foreign policy and military affairs, making Cuba a protectorate.",
      "Open Door Policy (1899-1900) : Promoted equal trade access to China for all foreign nations, protecting American economic interests.",
      "Philippine-American War (1899-1902) : Fought Filipino resistance after the U.S. took control of the Philippines, leading to prolonged conflict.",
      "Expansion of the U.S. Navy : Strengthened the Navy to support American imperialism and global trade interests.",
      "Civil Service Expansion : Continued merit-based reforms to reduce political corruption in government appointments.",
      "Industrial Growth Support : Backed policies favoring business expansion, technological advancements, and economic prosperity.",
    ],
    party: "Republican",
    spouse: "Ida Saxton McKinley",
    children: "2",
    occupationBeforePresidency: "Military Officer and Politician",
    quote:
      "The mission of the United States is one of benevolent assimilation.",
    image: "images/WilliamMcKinley.png",
    otherPresidents: [
      "Grover Cleveland",
      "Benjamin Harrison",
      "Theodore Roosevelt",
      "William Howard Taft",
      "Woodrow Wilson",
    ],
    otherPresidentThings: [
      {
        "Grover Cleveland":
          "In retirement after completing his second term in 1897; lived quietly in Princeton, New Jersey, and occasionally wrote or commented on national issues; died in 1908.",
      },
      {
        "Benjamin Harrison":
          "Lived in retirement in Indianapolis; practiced law and wrote about constitutional law and governance; died in 1901, the same year McKinley was assassinated.",
      },
      {
        "Theodore Roosevelt":
          "Served as Assistant Secretary of the Navy; led the Rough Riders during the Spanish-American War (1898); elected Governor of New York (1899); became McKinley’s vice president in 1901.",
      },
      {
        "William Howard Taft":
          "Appointed by McKinley as the first civilian Governor-General of the Philippines in 1901; previously served as a federal judge and was rising in national Republican ranks.",
      },
      {
        "Woodrow Wilson":
          "Academic and professor of political science at Princeton University; began gaining recognition as a political thinker and reform advocate.",
      },
    ],
  },
  {
    name: "Theodore Roosevelt",
    terms: 2,
    status: "dead",
    birthYear: 1858,
    birthPlace: "New York City, New York",
    parents: "Theodore Roosevelt Sr. and Martha Bulloch Roosevelt",
    deathYear: 1919,
    deathPlace: "Oyster Bay, New York",
    deathReason: "Heart attack",
    presidencyStart: 1901,
    presidencyEnd: 1909,
    keyPolicies: 13,
    policies: [
      "Square Deal (1901-1909) : Aimed at balancing the interests of business, consumers, and labor by promoting fair government intervention.",
      "Antitrust Actions (1902-1906) : Enforced the Sherman Antitrust Act aggressively, breaking up monopolies like the Northern Securities Company.",
      "Hepburn Act (1906) : Strengthened the Interstate Commerce Commission (ICC) to regulate railroad rates and prevent unfair pricing practices.",
      "Pure Food and Drug Act (1906) : Laid the foundation for the FDA by requiring accurate labeling and banning harmful substances in food and medicine.",
      "Meat Inspection Act (1906) : Mandated federal inspection of meatpacking plants, improving food safety and sanitation.",
      "Conservation Movement : Established five national parks, 18 national monuments, and over 100 million acres of protected forests.",
      "Newlands Reclamation Act (1902) : Funded irrigation projects in the western U.S. to support agriculture and settlement.",
      "Roosevelt Corollary (1904) : Expanded the Monroe Doctrine, stating that the U.S. could intervene in Latin America to maintain stability.",
      "Panama Canal Project (1903) : Negotiated control of the Panama Canal Zone, allowing the U.S. to build the canal and improve global trade routes.",
      "Great White Fleet (1907-1909) : Sent the U.S. Navy on a world tour to showcase American naval power and diplomacy.",
      "Anthracite Coal Strike Mediation (1902) : Intervened in a major coal strike, forcing negotiations between workers and mine owners, setting a precedent for government involvement in labor disputes.",
      "Gentlemen’s Agreement with Japan (1907) : Limited Japanese immigration to the U.S. while improving diplomatic relations with Japan.",
      "Employer Liability Act (1906) : Provided compensation for workers injured in hazardous jobs, an early step toward workers’ rights protection.",
    ],
    party: "Republican",
    spouse: "Edith Kermit Carow Roosevelt",
    children: "6",
    occupationBeforePresidency: "Military Leader and Politician",
    quote: "Do what you can, with what you have, where you are.",
    image: "images/TheodoreRoosevelt.png",
    otherPresidents: [
      "William McKinley",
      "Grover Cleveland",
      "Benjamin Harrison",
      "William Howard Taft",
      "Woodrow Wilson",
      "Warren G. Harding",
      "Calvin Coolidge",
      "Herbert Hoover",
    ],
    otherPresidentThings: [
      {
        "William McKinley":
          "Deceased — assassinated in September 1901, which led to Roosevelt’s unexpected succession to the presidency.",
      },
      {
        "Grover Cleveland":
          "In retirement in Princeton, New Jersey; occasionally commented on political events but was largely removed from active politics; died in 1908 during Roosevelt’s second term.",
      },
      {
        "Benjamin Harrison":
          "Deceased — died in 1901, the year Roosevelt took office.",
      },
      {
        "William Howard Taft":
          "Appointed Secretary of War by Roosevelt (1904); became Roosevelt’s close advisor and was handpicked as his successor; worked on reforms and oversaw U.S. interests in the Philippines and Panama Canal construction.",
      },
      {
        "Woodrow Wilson":
          "President of Princeton University (1902–1910); emerged as a national reform voice in education and governance; began aligning with progressive ideals.",
      },
      {
        "Warren G. Harding":
          "Served in the Ohio State Senate starting in 1899 and became Lieutenant Governor of Ohio in 1904; rising figure in Ohio Republican politics.",
      },
      {
        "Calvin Coolidge":
          "Studied law and began practicing in Massachusetts; became active in local and state Republican circles, holding early municipal offices.",
      },
      {
        "Herbert Hoover":
          "Successful international mining engineer and businessman; gained recognition for humanitarian efforts during the Boxer Rebellion and other global events.",
      },
    ],
  },
  {
    name: "William Howard Taft",
    status: "dead",
    birthYear: 1857,
    birthPlace: "Cincinnati, Ohio",
    parents: "Alphonso Taft and Louise Torrey Taft",
    deathYear: 1930,
    deathPlace: "Washington, D.C.",
    deathReason: "Heart attack",
    presidencyStart: 1909,
    presidencyEnd: 1913,
    keyPolicies: 12,
    policies: [
      "Payne-Aldrich Tariff Act (1909) : Raised some tariffs instead of lowering them as promised, causing controversy and splitting the Republican Party.",
      "Mann-Elkins Act (1910) : Strengthened the Interstate Commerce Commission (ICC) by allowing it to regulate telephone, telegraph, and railroad rates.",
      "Trust-Busting Policies : Filed **more antitrust lawsuits** than Roosevelt, breaking up monopolies like Standard Oil and American Tobacco.",
      "16th Amendment (1913) : Supported the constitutional amendment allowing Congress to collect a federal income tax.",
      "17th Amendment (1913) : Advocated for the direct election of U.S. Senators, increasing democracy and reducing political corruption.",
      "Ballinger-Pinchot Controversy (1909-1910) : Fired Gifford Pinchot, Roosevelt’s conservationist ally, for criticizing his administration’s land policies, weakening conservation efforts.",
      "Arizona and New Mexico Statehood (1912) : Oversaw the admission of Arizona and New Mexico as the 47th and 48th U.S. states.",
      "Children’s Bureau Creation (1912) : Established a federal agency to investigate and improve child labor conditions, child health, and welfare.",
      "Dollar Diplomacy (1909-1913) : Used economic influence rather than military force to expand U.S. interests in Latin America and Asia.",
      "Postal Savings System (1910) : Created a federal banking system that allowed people to deposit money in post offices, promoting financial stability for small savers.",
      "Department of Labor Established (1913) : Pushed for a separate federal department to oversee labor issues, which was later created after his presidency.",
      "Expansion of U.S. Territories : Strengthened American control over the **Philippines, Puerto Rico, and Panama** through diplomatic and economic policies.",
    ],
    party: "Republican",
    spouse: "Helen Herron Taft",
    children: "3",
    occupationBeforePresidency: "Judge and Politician",
    quote: "Presidents come and go, but the Supreme Court goes on forever.",
    image: "images/WilliamHowardTaft.png",
    otherPresidents: [
      "Theodore Roosevelt",
      "Woodrow Wilson",
      "Warren G. Harding",
      "Calvin Coolidge",
      "Herbert Hoover",
    ],
    otherPresidentThings: [
      {
        "Theodore Roosevelt":
          "Initially supported Taft as his successor but soon became disillusioned with his more conservative policies; broke from Taft and ran against him in the 1912 presidential election under the Progressive (Bull Moose) Party.",
      },
      {
        "Woodrow Wilson":
          "Governor of New Jersey (1911–1913); gained national prominence for progressive reforms and anti-corruption efforts; won the 1912 Democratic nomination and defeated both Taft and Roosevelt in the general election.",
      },
      {
        "Warren G. Harding":
          "Served as Lieutenant Governor of Ohio (1904–1906); after a short break from politics, he was elected to the U.S. Senate in 1914, gaining national influence.",
      },
      {
        "Calvin Coolidge":
          "Rising in Massachusetts state politics; served in the state legislature and began building a reputation for honest, quiet leadership.",
      },
      {
        "Herbert Hoover":
          "Gaining global recognition as a successful mining engineer and humanitarian; led relief efforts during various international crises and began advising government bodies.",
      },
    ],
  },
  {
    name: "Woodrow Wilson",
    terms: 2,
    status: "dead",
    birthYear: 1856,
    birthPlace: "Staunton, Virginia",
    parents: "Joseph Ruggles Wilson and Jessie Woodrow Wilson",
    deathYear: 1924,
    deathPlace: "Washington, D.C.",
    deathReason: "Stroke",
    presidencyStart: 1913,
    presidencyEnd: 1921,
    keyPolicies: 17,
    policies: [
      "Underwood Tariff Act (1913) : Lowered tariffs to promote free trade and reduce costs for consumers, replacing lost revenue with the new income tax.",
      "Federal Reserve Act (1913) : Created the Federal Reserve System to stabilize the banking industry and regulate the U.S. economy.",
      "Clayton Antitrust Act (1914) : Strengthened antitrust laws by prohibiting monopolistic practices and protecting labor unions from being targeted under antitrust laws.",
      "Federal Trade Commission Act (1914) : Established the Federal Trade Commission (FTC) to prevent unfair business practices and protect consumers.",
      "16th Amendment (1913) : Allowed the federal government to levy an income tax, creating a new revenue stream for the U.S.",
      "17th Amendment (1913) : Established the direct election of U.S. Senators, increasing democracy and reducing political corruption.",
      "18th Amendment (1919) : Pushed for prohibition, banning the production, sale, and transport of alcohol in the U.S.",
      "19th Amendment Advocacy (1918-1919) : Supported women's suffrage, leading to the passage of the 19th Amendment, which granted women the right to vote (ratified in 1920).",
      "World War I Leadership (1917-1918) : Led the U.S. into World War I after initially trying to keep the nation neutral.",
      "Selective Service Act (1917) : Instituted the military draft to build up U.S. forces for World War I.",
      "Espionage Act (1917) : Criminalized anti-war activities, making it illegal to interfere with the draft or military operations.",
      "Sedition Act (1918) : Further restricted free speech by making it illegal to criticize the government or war effort, later repealed.",
      "Fourteen Points (1918) : Outlined a vision for world peace after World War I, including the creation of the League of Nations.",
      "Treaty of Versailles (1919) : Helped negotiate the peace treaty that ended World War I, imposing strict penalties on Germany.",
      "League of Nations Proposal (1920) : Advocated for a global peacekeeping organization, though the U.S. Senate refused to join.",
      "Railway Administration Act (1917) : Temporarily nationalized the railroad industry to improve war logistics and efficiency.",
      "19th Amendment Ratification (1920) : Ensured the final passage of the women's right to vote, a significant victory for suffrage activists.",
    ],
    party: "Democratic",
    spouse: "Ellen Louise Axson Wilson",
    children: "3",
    occupationBeforePresidency: "Politician and Academic",
    quote: "The history of liberty is a history of resistance.",
    image: "images/WoodrowWilson.png",
    otherPresidents: [
      "William Howard Taft",
      "Warren G. Harding",
      "Calvin Coolidge",
      "Herbert Hoover",
    ],
    otherPresidentThings: [
      {
        "William Howard Taft":
          "After leaving the presidency in 1913, he returned to academia and legal work; became a vocal supporter of U.S. entry into World War I and was later appointed Chief Justice of the U.S. Supreme Court in 1921.",
      },
      {
        "Theodore Roosevelt":
          "Remained a dominant political figure and vocal critic of Wilson's policies, particularly on neutrality in WWI; advocated for military preparedness and ran unsuccessfully for president again in 1916; died in 1919.",
      },
      {
        "Warren G. Harding":
          "Elected to the U.S. Senate in 1914; supported conservative policies and neutrality in WWI but later backed U.S. involvement; became the Republican nominee for president in 1920.",
      },
      {
        "Calvin Coolidge":
          "Served as President of the Massachusetts State Senate and later Lieutenant Governor; gained national recognition for his response to the 1919 Boston Police Strike.",
      },
      {
        "Herbert Hoover":
          "Rose to international prominence for leading humanitarian relief efforts during and after World War I; served as head of the U.S. Food Administration under Wilson.",
      },
    ],
  },
  {
    name: "Warren G. Harding",
    status: "dead",
    birthYear: 1865,
    birthPlace: "Blooming Grove, Ohio",
    parents: "George Tryon Harding and Phoebe Dickerson Harding",
    deathYear: 1923,
    deathPlace: "San Francisco, California",
    deathReason: "Heart attack",
    presidencyStart: 1921,
    presidencyEnd: 1923,
    keyPolicies: 10,
    policies: [
      "Emergency Quota Act (1921) : Established the first immigration restrictions in U.S. history, limiting the number of immigrants from certain countries.",
      "Revenue Act of 1921 : Reduced income tax rates, especially for the wealthy, as part of Harding’s pro-business economic policies.",
      "Budget and Accounting Act (1921) : Created the Bureau of the Budget and required the president to submit an annual budget to Congress, improving government financial management.",
      "Fordney-McCumber Tariff (1922) : Raised tariffs to protect American industries, but it also made foreign goods more expensive and harmed international trade.",
      "Washington Naval Conference (1921-1922) : Led an international effort to reduce naval armaments and prevent future conflicts among major powers.",
      "Veterans Bureau Creation (1921) : Established a government agency to assist World War I veterans with healthcare and benefits.",
      "Teapot Dome Scandal (1921-1923) : A major corruption scandal involving illegal leasing of government oil reserves, damaging Harding’s legacy.",
      "Opposition to League of Nations : Continued the U.S. policy of isolationism by rejecting involvement in the League of Nations.",
      "Civil Rights Speech in Alabama (1921) : Became the first sitting president to publicly call for equal rights for African Americans in the South, though no major legislation followed.",
      "Anti-Lynching Bill Support : Pushed for anti-lynching legislation, but Congress failed to pass it due to Southern opposition.",
    ],
    party: "Republican",
    spouse: "Florence Kling Harding",
    children: "1",
    occupationBeforePresidency: "Newspaper Publisher",
    quote: "America’s present need is not heroics but healing.",
    image: "images/WarrenHarding.png",
    otherPresidents: [
      "Woodrow Wilson",
      "Calvin Coolidge",
      "Herbert Hoover",
      "William Howard Taft",
    ],
    otherPresidentThings: [
      {
        "Woodrow Wilson":
          "In retirement after leaving office in 1921; in poor health following a stroke; lived in Washington, D.C., and remained largely out of the public eye until his death in 1924.",
      },
      {
        "William Howard Taft":
          "Appointed Chief Justice of the U.S. Supreme Court by Harding in 1921; became the only person to serve as both president and chief justice; focused on court modernization and administration.",
      },
      {
        "Calvin Coolidge":
          "Served as Harding’s vice president; largely quiet during Harding’s term, but became president upon Harding’s death in August 1923.",
      },
      {
        "Herbert Hoover":
          "Appointed Secretary of Commerce under Harding; played a major role in standardizing regulations, promoting economic modernization, and coordinating relief efforts during disasters.",
      },
    ],
  },
  {
    name: "Calvin Coolidge",
    status: "dead",
    birthYear: 1872,
    birthPlace: "Plymouth Notch, Vermont",
    parents: "John Calvin Coolidge Sr. and Victoria Josephine Moor Coolidge",
    deathYear: 1933,
    deathPlace: "Northampton, Massachusetts",
    deathReason: "Heart attack",
    presidencyStart: 1923,
    presidencyEnd: 1929,
    keyPolicies: 10,
    policies: [
      "Revenue Acts of 1924 and 1926 : Lowered income tax rates, especially for the wealthy, as part of his pro-business, limited-government approach.",
      "Immigration Act of 1924 : Drastically reduced immigration, especially from Southern and Eastern Europe, and **completely banned immigration from Asia.**",
      "Kellogg-Briand Pact (1928) : Signed an international agreement renouncing war as a tool for national policy, though it had little enforcement power.",
      "Dawes Plan (1924) : Helped restructure Germany’s World War I reparations, stabilizing the European economy and preventing another crisis.",
      "Laissez-Faire Economic Policies : Advocated for minimal government intervention in the economy, allowing businesses to operate freely.",
      "Expansion of the Federal Radio Commission (1927) : Regulated airwaves to bring order to the growing radio industry.",
      "Opposition to Farm Relief Bills : Vetoed the **McNary-Haugen Farm Relief Bill** twice, refusing federal price support for struggling farmers.",
      "Great Mississippi Flood Response (1927) : Provided limited federal aid after the devastating flood but resisted direct government intervention.",
      "Civil Rights Efforts : Supported anti-lynching laws and spoke out against the Ku Klux Klan, but no major legislation was passed.",
      "Continued Isolationist Foreign Policy : Avoided military entanglements and focused on economic diplomacy instead.",
    ],
    party: "Republican",
    spouse: "Grace Anna Goodhue Coolidge",
    children: "2",
    occupationBeforePresidency: "Lawyer and Politician",
    quote: "The business of America is business.",
    image: "images/CalvinCoolidge.png",
    otherPresidents: [
      "Warren G. Harding",
      "Woodrow Wilson",
      "William Howard Taft",
      "Herbert Hoover",
      "Franklin D. Roosevelt",
      "Harry S. Truman",
    ],
    otherPresidentThings: [
      {
        "Warren G. Harding":
          "Deceased — died in office in August 1923; Coolidge, his vice president, succeeded him as president.",
      },
      {
        "Woodrow Wilson":
          "Deceased — died in 1924; spent his final years in frail health following a major stroke, largely out of public life after 1921.",
      },
      {
        "William Howard Taft":
          "Continued serving as Chief Justice of the U.S. Supreme Court; focused on administrative reform and preserving judicial independence until his death in 1930.",
      },
      {
        "Herbert Hoover":
          "Served as Secretary of Commerce under both Harding and Coolidge; promoted economic modernization and standardization; gained national prominence and was nominated for president in 1928.",
      },
      {
        "Franklin D. Roosevelt":
          "Served as Vice Presidential candidate on the losing Democratic ticket in 1920; resumed work as a private citizen and began rebuilding his political career while battling polio.",
      },
      {
        "Harry S. Truman":
          "Operated a men's clothing store in Missouri during most of Coolidge’s presidency; became active in local Democratic politics and was elected as a judge in 1922.",
      },
    ],
  },
  {
    name: "Herbert Hoover",
    status: "dead",
    birthYear: 1874,
    birthPlace: "West Branch, Iowa",
    parents: "Jesse Hoover and Hulda Minerva Hoover",
    deathYear: 1964,
    deathPlace: "New York City, New York",
    deathReason: "Heart attack",
    presidencyStart: 1929,
    presidencyEnd: 1933,
    keyPolicies: 10,
    policies: [
      "Stock Market Crash Response (1929) : Urged businesses to maintain wages and employment after the stock market collapse, but avoided direct government intervention.",
      "Smoot-Hawley Tariff Act (1930) : Raised tariffs on imported goods to protect American industries, but worsened the Great Depression by reducing international trade.",
      "Reconstruction Finance Corporation (1932) : Provided emergency loans to banks, railroads, and other businesses to stabilize the economy during the Great Depression.",
      "Federal Home Loan Bank Act (1932) : Established a system of banks to provide low-interest loans for homeowners to prevent foreclosures.",
      "Public Works Programs : Increased federal spending on infrastructure projects like the **Hoover Dam** to create jobs and stimulate the economy.",
      "Opposition to Direct Relief : Rejected direct federal aid to individuals, believing in 'rugged individualism' and local charity support instead.",
      "Bonus Army Crackdown (1932) : Ordered the removal of World War I veterans protesting in Washington for early bonus payments, leading to a violent clash with federal troops.",
      "National Credit Corporation (1931) : Encouraged large banks to lend money to smaller struggling banks to prevent widespread banking failures.",
      "Mexican Repatriation Program : Oversaw mass deportations of Mexican-Americans and Mexican immigrants during the Great Depression to free up jobs for white workers.",
      "Revenue Act of 1932 : Increased taxes on corporations and individuals, worsening the economic downturn instead of helping recovery.",
    ],
    party: "Republican",
    spouse: "Lou Henry Hoover",
    children: "2",
    occupationBeforePresidency: "Engineer and Politician",
    quote: "Blessed are the young, for they shall inherit the national debt.",
    image: "images/HerbertHoover.png",
    otherPresidents: [
      "Calvin Coolidge",
      "Warren G. Harding",
      "Woodrow Wilson",
      "William Howard Taft",
      "Franklin D. Roosevelt",
      "Harry S. Truman",
    ],

    otherPresidentThings: [
      {
        "Calvin Coolidge":
          "Retired from politics after leaving office in 1929; remained publicly silent on Hoover's presidency but privately expressed concerns about the economy and Hoover’s leadership style.",
      },
      {
        "Warren G. Harding": "Deceased — died in office in 1923.",
      },
      {
        "Woodrow Wilson":
          "Deceased — died in 1924 after several years in retirement and poor health.",
      },
      {
        "William Howard Taft":
          "Continued to serve as Chief Justice of the U.S. Supreme Court until his death in 1930; did not publicly comment on Hoover’s presidency but remained a respected national figure.",
      },
      {
        "Franklin D. Roosevelt":
          "Served as Governor of New York (1929–1932); implemented state-level relief programs during the early years of the Great Depression; emerged as Hoover's main challenger and won the 1932 presidential election.",
      },
      {
        "Harry S. Truman":
          "Served as a judge in Missouri; involved in local Democratic politics and gaining influence but had not yet reached national prominence.",
      },
    ],
  },
  {
    name: "Franklin D. Roosevelt",
    terms: 2,
    status: "dead",
    birthYear: 1882,
    birthPlace: "Hyde Park, New York",
    parents: "James Roosevelt I and Sara Delano Roosevelt",
    deathYear: 1945,
    deathPlace: "Warm Springs, Georgia",
    deathReason: "Cerebral hemorrhage",
    presidencyStart: 1933,
    presidencyEnd: 1945,
    keyPolicies: 17,
    policies: [
      "New Deal (1933-1939) : A series of programs and reforms designed to combat the Great Depression by providing economic relief, recovery, and reform.",
      "Emergency Banking Act (1933) : Closed all banks for four days to prevent panic, then reopened only those deemed financially stable.",
      "Glass-Steagall Act (1933) : Separated commercial and investment banking to prevent financial speculation, also established the Federal Deposit Insurance Corporation (FDIC).",
      "Civilian Conservation Corps (CCC) (1933) : Created jobs for young men in conservation projects like planting trees and building parks.",
      "Tennessee Valley Authority (TVA) (1933) : Built dams and hydroelectric plants in the Tennessee Valley to provide electricity and jobs.",
      "Agricultural Adjustment Act (AAA) (1933) : Paid farmers to reduce crop production to stabilize agricultural prices.",
      "National Industrial Recovery Act (NIRA) (1933) : Established industry-wide regulations to control wages, prices, and working conditions.",
      "Social Security Act (1935) : Created unemployment insurance, pensions for the elderly, and aid for the disabled, laying the foundation for the modern welfare system.",
      "Wagner Act (1935) : Strengthened workers' rights by guaranteeing unions the right to collectively bargain.",
      "Fair Labor Standards Act (1938) : Established the first federal minimum wage, maximum work hours, and restrictions on child labor.",
      "Neutrality Acts (1935-1939) : Passed a series of laws to prevent U.S. involvement in foreign wars by limiting arms sales and loans to warring nations.",
      "Lend-Lease Act (1941) : Allowed the U.S. to provide military aid to Allied nations during World War II, marking the end of strict neutrality.",
      "Pearl Harbor Response & U.S. Entry into World War II (1941) : Led the nation into World War II after the Japanese attack on Pearl Harbor.",
      "Executive Order 9066 (1942) : Authorized the internment of Japanese Americans during World War II, a highly controversial policy.",
      "Manhattan Project (1942-1945) : Secretly developed the atomic bomb, which later played a role in ending the war.",
      "G.I. Bill (1944) : Provided education and housing benefits to returning World War II veterans, helping boost the post-war economy.",
      "Yalta Conference (1945) : Negotiated post-war plans with Allied leaders, setting the stage for the Cold War.",
    ],
    party: "Democratic",
    spouse: "Eleanor Roosevelt",
    children: "6",
    occupationBeforePresidency: "Politician and Lawyer",
    quote: "The only thing we have to fear is fear itself.",
    image: "images/FranklinRoosevelt.png",
    otherPresidents: [
      "Herbert Hoover",
      "Calvin Coolidge",
      "William Howard Taft",
      "Harry S. Truman",
      "Dwight D. Eisenhower",
      "Lyndon B. Johnson",
      "John F. Kennedy",
    ],

    otherPresidentThings: [
      {
        "Herbert Hoover":
          "After losing to Roosevelt in 1932, Hoover became a vocal critic of the New Deal; remained active in Republican politics and wrote extensively on government and economics.",
      },
      {
        "Calvin Coolidge":
          "Deceased — died in 1933, shortly before Roosevelt took office.",
      },
      {
        "William Howard Taft":
          "Deceased — died in 1930; had served as Chief Justice of the Supreme Court until shortly before his death.",
      },
      {
        "Harry S. Truman":
          "Served as U.S. Senator from Missouri (elected 1934); supported many New Deal programs and gained national recognition for his work investigating wartime spending.",
      },
      {
        "Dwight D. Eisenhower":
          "Rose through military ranks during WWII; served as Supreme Allied Commander in Europe and oversaw D-Day operations; became a national hero by the end of Roosevelt’s presidency.",
      },
      {
        "Lyndon B. Johnson":
          "Elected to U.S. House of Representatives in 1937; ardent supporter of New Deal programs; built political clout through his connection to Roosevelt and ability to deliver on federal programs in Texas.",
      },
      {
        "John F. Kennedy":
          "Teenager during most of Roosevelt’s presidency; studied at Harvard and briefly worked as a journalist; served in the Navy during WWII late in Roosevelt’s final term.",
      },
    ],
  },
  {
    name: "Harry S. Truman",
    status: "dead",
    birthYear: 1884,
    birthPlace: "Lamar, Missouri",
    parents: "John Anderson Truman and Martha Ellen Young Truman",
    deathYear: 1972,
    deathPlace: "Kansas City, Missouri",
    deathReason: "Heart failure",
    presidencyStart: 1945,
    presidencyEnd: 1953,
    keyPolicies: 13,
    policies: [
      "Truman Doctrine (1947) : Established the U.S. policy of containing communism by providing military and economic aid to countries resisting Soviet influence, starting with Greece and Turkey.",
      "Marshall Plan (1948) : Provided over $13 billion in economic aid to rebuild Western Europe after World War II, preventing the spread of communism.",
      "Berlin Airlift (1948-1949) : Ordered the U.S. to supply West Berlin with food and fuel by air when the Soviet Union blockaded the city.",
      "Creation of NATO (1949) : Helped establish the North Atlantic Treaty Organization, a military alliance aimed at countering Soviet expansion.",
      "Recognition of Israel (1948) : Became the first world leader to recognize the newly established state of Israel, shaping U.S.-Middle East relations.",
      "Fair Deal (1949) : Proposed expanding New Deal programs with national health insurance, housing assistance, and civil rights protections (though Congress rejected many parts).",
      "Executive Order 9981 (1948) : Desegregated the U.S. military, making it one of the first federal institutions to end racial segregation.",
      "Korean War (1950-1953) : Sent U.S. forces to defend South Korea against a communist invasion from North Korea, marking the first military conflict of the Cold War.",
      "Employment Act of 1946 : Committed the federal government to promoting maximum employment and economic growth.",
      "Housing Act of 1949 : Funded public housing projects to address post-war housing shortages.",
      "Atomic Energy Act (1946) : Established civilian control over nuclear energy and promoted peaceful uses of atomic power.",
      "McCarran Act (1950) : Increased restrictions on suspected communist organizations during the Red Scare, though Truman opposed it.",
      "22nd Amendment Ratification (1951) : Limited U.S. presidents to two terms, a reaction to Franklin D. Roosevelt’s four-term presidency.",
    ],
    party: "Democratic",
    spouse: "Bess Wallace Truman",
    children: "1",
    occupationBeforePresidency: "Politician and Farmer",
    quote: "The buck stops here.",
    image: "images/HarryTruman.png",
    otherPresidents: [
      "Franklin D. Roosevelt",
      "Herbert Hoover",
      "Dwight D. Eisenhower",
      "John F. Kennedy",
      "Lyndon B. Johnson",
      "Richard Nixon",
      "Gerald Ford",
    ],

    otherPresidentThings: [
      {
        "Franklin D. Roosevelt":
          "Deceased — died in April 1945, shortly after beginning his fourth term; Truman succeeded him during the final months of WWII.",
      },
      {
        "Herbert Hoover":
          "Outspoken critic of New Deal policies but supported Truman's postwar European relief efforts; worked with Truman on reorganization of the executive branch and humanitarian relief.",
      },
      {
        "Dwight D. Eisenhower":
          "Served as Army Chief of Staff and later NATO Supreme Commander in Europe; maintained nonpartisan stance but became increasingly viewed as a presidential contender by both parties.",
      },
      {
        "John F. Kennedy":
          "Served in the U.S. Navy during World War II; elected to the U.S. House of Representatives from Massachusetts in 1946 during Truman’s presidency.",
      },
      {
        "Lyndon B. Johnson":
          "Elected to the U.S. House of Representatives; strongly supported Truman’s Fair Deal and anti-communist foreign policy; elected to U.S. Senate in 1948.",
      },
      {
        "Richard Nixon":
          "Elected to the U.S. House of Representatives in 1946; gained national attention for his role in the House Un-American Activities Committee, particularly in the Alger Hiss case.",
      },
      {
        "Gerald Ford":
          "Served in the U.S. Navy during World War II; returned to Michigan and became active in Republican politics, though had not yet entered Congress during Truman’s presidency.",
      },
    ],
  },
  {
    name: "Dwight D. Eisenhower",
    terms: 2,
    status: "dead",
    birthYear: 1890,
    birthPlace: "Denison, Texas",
    parents: "David Jacob Eisenhower and Ida Elizabeth Stover Eisenhower",
    deathYear: 1969,
    deathPlace: "Washington, D.C.",
    deathReason: "Heart failure",
    presidencyStart: 1953,
    presidencyEnd: 1961,
    keyPolicies: 14,
    policies: [
      "Interstate Highway System (1956) : Created a nationwide network of highways, improving transportation, boosting the economy, and strengthening national defense.",
      "Civil Rights Act of 1957 : First civil rights legislation since Reconstruction, aimed at protecting African American voting rights.",
      "Civil Rights Act of 1960 : Strengthened federal oversight of voter registration and penalties for obstructing voting rights.",
      "Brown v. Board of Education Enforcement (1954) : Sent federal troops to enforce school desegregation in Little Rock, Arkansas, after the Supreme Court ruling.",
      "NASA Establishment (1958) : Founded the National Aeronautics and Space Administration (NASA) to compete with the Soviet Union in the Space Race.",
      "Eisenhower Doctrine (1957) : Declared that the U.S. would provide military and economic assistance to Middle Eastern countries resisting communism.",
      "Korean War Armistice (1953) : Negotiated the end of active fighting in Korea, leading to a long-term ceasefire and division between North and South Korea.",
      "Massive Retaliation Policy (1954) : Shifted U.S. military strategy to emphasize nuclear deterrence against Soviet threats instead of conventional warfare.",
      "McCarthyism Opposition (1954) : Publicly condemned Senator Joseph McCarthy’s anti-communist witch hunts, leading to McCarthy’s downfall.",
      "Social Security Expansion (1954, 1956) : Increased benefits and coverage for millions of Americans, making Social Security more accessible.",
      "St. Lawrence Seaway (1959) : Opened up shipping routes between the U.S. and Canada, boosting trade and economic growth.",
      "National Defense Education Act (1958) : Provided federal funding for science, math, and technology education to counter Soviet advancements after the Sputnik launch.",
      "Balanced Budget and Fiscal Conservatism : Maintained economic stability by balancing the federal budget three times while promoting infrastructure growth.",
      "U-2 Spy Plane Incident (1960) : U.S. spy plane shot down over the Soviet Union, leading to increased Cold War tensions and a failed diplomatic summit.",
    ],
    party: "Republican",
    spouse: "Mamie Geneva Doud Eisenhower",
    children: "2",
    occupationBeforePresidency: "Military Leader",
    quote: "Plans are worthless, but planning is everything.",
    image: "images/DwightEisenhower.png",
    otherPresidents: [
      "Harry S. Truman",
      "Herbert Hoover",
      "John F. Kennedy",
      "Lyndon B. Johnson",
      "Richard Nixon",
      "Gerald Ford",
      "Jimmy Carter",
    ],

    otherPresidentThings: [
      {
        "Harry S. Truman":
          "In retirement after leaving office in 1953; wrote memoirs and established the Truman Library; occasionally commented on Eisenhower’s policies, particularly on civil rights and foreign affairs.",
      },
      {
        "Herbert Hoover":
          "In retirement but continued public service; worked on government reorganization and advised presidents on administrative reform; praised Eisenhower’s managerial style.",
      },
      {
        "John F. Kennedy":
          "Served in the U.S. Senate; became a prominent Democratic voice on foreign policy and civil rights; published *Profiles in Courage* in 1956 and began preparing for a presidential run.",
      },
      {
        "Lyndon B. Johnson":
          "Served as Senate Majority Leader; key Democratic power broker who collaborated with and challenged Eisenhower on domestic and foreign policy.",
      },
      {
        "Richard Nixon":
          "Served as Vice President under Eisenhower for both terms; represented the U.S. abroad and presided over Cabinet and National Security Council meetings; gained prominence as Eisenhower’s political heir.",
      },
      {
        "Gerald Ford":
          "Elected to the U.S. House of Representatives in 1948; served as a Republican leader in Congress during Eisenhower’s presidency and built a reputation for integrity and competence.",
      },
      {
        "Jimmy Carter":
          "Graduated from the U.S. Naval Academy and served as a naval officer; returned to Georgia in the mid-1950s to run his family’s peanut business; not yet involved in national politics.",
      },
    ],
  },
  {
    name: "John F. Kennedy",
    status: "dead",
    birthYear: 1917,
    birthPlace: "Brookline, Massachusetts",
    parents: "Joseph P. Kennedy Sr. and Rose Fitzgerald Kennedy",
    deathYear: 1963,
    deathPlace: "Dallas, Texas",
    deathReason: "Assassination",
    presidencyStart: 1961,
    presidencyEnd: 1963,
    keyPolicies: 12,
    policies: [
      "New Frontier Program (1961-1963) : Proposed domestic policies focusing on civil rights, poverty reduction, education, and space exploration.",
      "Bay of Pigs Invasion (1961) : Approved a failed CIA-backed invasion of Cuba by Cuban exiles, which strengthened Fidel Castro’s rule and embarrassed the U.S.",
      "Cuban Missile Crisis (1962) : Successfully negotiated the removal of Soviet nuclear missiles from Cuba, bringing the world to the brink of nuclear war.",
      "Peace Corps Establishment (1961) : Created a volunteer program to send Americans abroad to assist with education, healthcare, and economic development in developing nations.",
      "Alliance for Progress (1961) : Provided economic aid to Latin American countries to prevent the spread of communism and promote development.",
      "Trade Expansion Act (1962) : Reduced tariffs and encouraged international trade, especially with Western Europe.",
      "Equal Pay Act (1963) : First major law addressing gender pay inequality, requiring equal wages for men and women performing the same job.",
      "Space Race Acceleration : Set the goal of landing a man on the moon by the end of the 1960s, leading to NASA’s Apollo program.",
      "Civil Rights Advocacy : Called for stronger civil rights laws, laying the groundwork for the Civil Rights Act of 1964 (signed after his assassination).",
      "Nuclear Test Ban Treaty (1963) : Negotiated a treaty with the Soviet Union and Britain banning nuclear tests in the atmosphere, outer space, and underwater.",
      "Manpower Development and Training Act (1962) : Provided job training programs for unemployed workers to reduce poverty and boost employment.",
      "Housing Act of 1961 : Expanded federal funding for urban renewal and affordable housing projects.",
    ],
    party: "Democratic",
    spouse: "Jacqueline Bouvier Kennedy",
    children: "4",
    occupationBeforePresidency: "Politician and Author",
    quote:
      "Ask not what your country can do for you—ask what you can do for your country.",
    image: "images/JohnFKennedy.png",
    otherPresidents: [
      "Dwight D. Eisenhower",
      "Harry S. Truman",
      "Lyndon B. Johnson",
      "Richard Nixon",
      "Gerald Ford",
      "Jimmy Carter",
      "Ronald Reagan",
    ],

    otherPresidentThings: [
      {
        "Dwight D. Eisenhower":
          "In retirement at his Gettysburg farm; served as an elder statesman, occasionally advising Kennedy on military and foreign affairs; supported a strong anti-communist stance.",
      },
      {
        "Harry S. Truman":
          "In retirement in Missouri; publicly supported Kennedy’s 1960 campaign and continued to speak on party unity and civil rights during Kennedy’s term.",
      },
      {
        "Lyndon B. Johnson":
          "Served as Vice President under Kennedy; chaired several commissions and was active in space policy and civil rights, though often sidelined from Kennedy’s inner circle.",
      },
      {
        "Richard Nixon":
          "Returned to private life in California after narrowly losing the 1960 election; remained active in Republican politics and prepared for a political comeback.",
      },
      {
        "Gerald Ford":
          "Continued serving in the U.S. House of Representatives; an emerging Republican voice on defense and fiscal policy during Kennedy’s presidency.",
      },
      {
        "Jimmy Carter":
          "Served in the Georgia State Senate; began aligning himself with moderate Democratic reformers; built his reputation as a detail-oriented, pragmatic politician.",
      },
      {
        "Ronald Reagan":
          "Still an actor and public spokesman for General Electric; gave his famous “A Time for Choosing” speech in 1964 shortly after Kennedy’s assassination, marking his entry into politics.",
      },
    ],
  },
  {
    name: "Lyndon B. Johnson",
    status: "dead",
    birthYear: 1908,
    birthPlace: "Stonewall, Texas",
    parents: "Samuel Ealy Johnson Jr. and Rebekah Baines Johnson",
    deathYear: 1973,
    deathPlace: "Johnson City, Texas",
    deathReason: "Heart attack",
    presidencyStart: 1963,
    presidencyEnd: 1969,
    keyPolicies: 14,
    policies: [
      "Civil Rights Act of 1964 : Prohibited racial discrimination in public places, employment, and education, marking a major victory for the civil rights movement.",
      "Voting Rights Act of 1965 : Outlawed literacy tests and other discriminatory practices that prevented African Americans from voting.",
      "Great Society Programs (1964-1968) : A set of domestic policies aimed at eliminating poverty and racial injustice through education, healthcare, and social welfare programs.",
      "Medicare and Medicaid (1965) : Established government-funded healthcare programs for the elderly (Medicare) and low-income individuals (Medicaid).",
      "Elementary and Secondary Education Act (1965) : Provided federal funding to improve schools, especially in low-income communities.",
      "Higher Education Act (1965) : Expanded federal funding for college students through financial aid programs like Pell Grants and student loans.",
      "War on Poverty : Launched programs like Head Start, Job Corps, and food stamps to reduce poverty in the U.S.",
      "Economic Opportunity Act (1964) : Created agencies to provide job training, adult education, and small business loans to help impoverished Americans.",
      "Immigration and Nationality Act (1965) : Abolished the immigration quota system based on nationality, opening the U.S. to immigrants from Asia, Africa, and Latin America.",
      "Fair Housing Act (1968) : Prohibited discrimination in housing based on race, religion, or national origin.",
      "Public Broadcasting Act (1967) : Established the Corporation for Public Broadcasting, leading to the creation of PBS and NPR.",
      "Gun Control Act (1968) : Introduced federal regulations on the sale and possession of firearms following the assassinations of Martin Luther King Jr. and Robert Kennedy.",
      "Vietnam War Escalation : Increased U.S. military involvement in Vietnam, leading to widespread protests and controversy.",
      "Civil Rights Act of 1968 : Expanded civil rights protections, including protections against racial discrimination in housing.",
    ],
    party: "Democratic",
    spouse: "Lady Bird Johnson",
    children: "2",
    occupationBeforePresidency: "Politician and Teacher",
    quote:
      "Yesterday is not ours to recover, but tomorrow is ours to win or lose.",
    image: "images/LyndonBJohnson.png",
    otherPresidents: [
      "John F. Kennedy",
      "Dwight D. Eisenhower",
      "Harry S. Truman",
      "Richard Nixon",
      "Gerald Ford",
      "Jimmy Carter",
      "Ronald Reagan",
      "George H. W. Bush",
    ],

    otherPresidentThings: [
      {
        "John F. Kennedy":
          "Deceased — assassinated in November 1963; Johnson assumed the presidency and pursued many of Kennedy’s legislative goals, including civil rights reform.",
      },
      {
        "Dwight D. Eisenhower":
          "In retirement; continued to offer public commentary on national issues and supported Johnson’s foreign policy in Vietnam; died in 1969.",
      },
      {
        "Harry S. Truman":
          "In retirement in Missouri; increasingly reclusive due to health issues; died in 1972, shortly after Johnson’s presidency ended.",
      },
      {
        "Richard Nixon":
          "Returned to national politics; campaigned for Republican candidates in the 1966 midterms and positioned himself for the 1968 presidential race, which he won.",
      },
      {
        "Gerald Ford":
          "Served as House Minority Leader; frequently challenged Johnson’s Great Society spending but supported aspects of civil rights and foreign policy.",
      },
      {
        "Jimmy Carter":
          "Elected Governor of Georgia in 1966; began building a reputation as a reform-minded moderate within the Democratic Party.",
      },
      {
        "Ronald Reagan":
          "Elected Governor of California in 1966; quickly became a national conservative figure and frequent critic of Johnson’s domestic and Vietnam policies.",
      },
      {
        "George H. W. Bush":
          "Ran unsuccessfully for U.S. Senate in Texas in 1964; elected to the U.S. House of Representatives in 1966 and became an emerging voice in the Republican Party.",
      },
    ],
  },
  {
    name: "Richard Nixon",
    status: "dead",
    birthYear: 1913,
    birthPlace: "Yorba Linda, California",
    parents: "Francis A. Nixon and Hannah Milhous Nixon",
    deathYear: 1994,
    deathPlace: "New York City, New York",
    deathReason: "Stroke",
    presidencyStart: 1969,
    presidencyEnd: 1974,
    keyPolicies: 15,
    policies: [
      "Environmental Protection Agency (EPA) (1970) : Established the EPA to enforce environmental regulations and protect natural resources.",
      "Clean Air Act (1970) : Strengthened air pollution regulations and set national standards for air quality.",
      "Endangered Species Act (1973) : Provided protections for threatened and endangered species and their habitats.",
      "Detente with Soviet Union (1969-1974) : Improved U.S.-Soviet relations through arms control agreements, including the SALT I Treaty.",
      "Opening Relations with China (1972) : Became the first U.S. president to visit Communist China, leading to improved diplomatic and trade relations.",
      "Vietnamization Policy (1969) : Gradually withdrew U.S. troops from Vietnam while increasing military aid to South Vietnam.",
      "Paris Peace Accords (1973) : Negotiated a ceasefire in Vietnam, leading to the withdrawal of U.S. forces.",
      "War on Drugs (1971) : Declared drug abuse a national emergency, leading to stricter drug laws and the creation of the Drug Enforcement Administration (DEA) in 1973.",
      "Revenue Sharing Program (1972) : Shifted federal funds to state and local governments to give them more control over spending.",
      "Occupational Safety and Health Administration (OSHA) (1971) : Created OSHA to regulate workplace safety and protect workers' rights.",
      "26th Amendment (1971) : Lowered the voting age from 21 to 18, expanding political participation for young Americans.",
      "Title IX of the Education Amendments (1972) : Prohibited gender discrimination in federally funded education programs and athletics.",
      "Wage and Price Controls (1971) : Implemented temporary wage and price controls to combat inflation and stabilize the economy.",
      "End of Bretton Woods System (1971) : Took the U.S. off the gold standard, allowing the dollar to float freely in foreign exchange markets.",
      "Watergate Scandal (1972-1974) : A political scandal involving a break-in at the Democratic National Committee headquarters, leading to Nixon’s resignation.",
    ],
    party: "Republican",
    spouse: "Pat Nixon",
    children: "2",
    occupationBeforePresidency: "Politician and Lawyer",
    quote: "The greatest honor history can bestow is the title of peacemaker.",
    image: "images/RichardNixon.png",
    otherPresidents: [
      "John F. Kennedy",
      "Dwight D. Eisenhower",
      "Harry S. Truman",
      "Richard Nixon",
      "Gerald Ford",
      "Jimmy Carter",
      "Ronald Reagan",
      "George H. W. Bush",
    ],

    otherPresidentThings: [
      {
        "John F. Kennedy":
          "Deceased — assassinated in November 1963; Johnson assumed the presidency and pursued many of Kennedy’s legislative goals, including civil rights reform.",
      },
      {
        "Dwight D. Eisenhower":
          "In retirement; continued to offer public commentary on national issues and supported Johnson’s foreign policy in Vietnam; died in 1969.",
      },
      {
        "Harry S. Truman":
          "In retirement in Missouri; increasingly reclusive due to health issues; died in 1972, shortly after Johnson’s presidency ended.",
      },
      {
        "Richard Nixon":
          "Returned to national politics; campaigned for Republican candidates in the 1966 midterms and positioned himself for the 1968 presidential race, which he won.",
      },
      {
        "Gerald Ford":
          "Served as House Minority Leader; frequently challenged Johnson’s Great Society spending but supported aspects of civil rights and foreign policy.",
      },
      {
        "Jimmy Carter":
          "Elected Governor of Georgia in 1966; began building a reputation as a reform-minded moderate within the Democratic Party.",
      },
      {
        "Ronald Reagan":
          "Elected Governor of California in 1966; quickly became a national conservative figure and frequent critic of Johnson’s domestic and Vietnam policies.",
      },
      {
        "George H. W. Bush":
          "Ran unsuccessfully for U.S. Senate in Texas in 1964; elected to the U.S. House of Representatives in 1966 and became an emerging voice in the Republican Party.",
      },
    ],
  },
  {
    name: "Gerald Ford",
    status: "dead",
    birthYear: 1913,
    birthPlace: "Omaha, Nebraska",
    parents: "Leslie Lynch King Sr. and Dorothy Ayer Gardner Ford",
    deathYear: 2006,
    deathPlace: "Rancho Mirage, California",
    deathReason: "Cardiovascular disease",
    presidencyStart: 1974,
    presidencyEnd: 1977,
    keyPolicies: 12,
    policies: [
      "Presidential Pardon of Richard Nixon (1974) : Granted a full pardon to former President Nixon for any crimes related to the Watergate scandal, sparking national controversy.",
      "Helsinki Accords (1975) : Signed an agreement with 34 other nations to ease Cold War tensions and promote human rights in Eastern Europe.",
      "Whip Inflation Now (WIN) Program (1974) : Launched a voluntary program to curb inflation by encouraging personal savings and reduced spending, but it had little impact.",
      "Energy Policy Initiatives : Encouraged energy conservation and the development of alternative energy sources in response to the 1973 oil crisis.",
      "Privacy Act of 1974 : Strengthened protections for personal information held by the federal government.",
      "Education for All Handicapped Children Act (1975) : Required public schools to provide equal education opportunities for children with disabilities.",
      "Expansion of Food Stamp Program : Increased funding for food assistance programs to help low-income families.",
      "Fall of Saigon & End of Vietnam War (1975) : Oversaw the evacuation of U.S. personnel and Vietnamese refugees as North Vietnam took over South Vietnam, marking the final end of the Vietnam War.",
      "Operation Babylift (1975) : Ordered the evacuation of thousands of orphaned Vietnamese children to the United States following the fall of Saigon.",
      "Tax Reduction Act of 1975 : Implemented temporary tax cuts to stimulate economic growth during a recession.",
      "New York City Bailout (1975) : Approved federal loans to prevent New York City from going bankrupt during its financial crisis.",
      "Expansion of CIA Oversight : Strengthened congressional oversight of intelligence agencies after revelations of CIA abuses in domestic surveillance.",
    ],
    party: "Republican",
    spouse: "Betty Ford",
    children: "4",
    occupationBeforePresidency: "Politician and Lawyer",
    quote:
      "A government big enough to give you everything you want is a government big enough to take from you everything you have.",
    image: "images/GeraldFord.png",
    otherPresidents: [
      "Richard Nixon",
      "Jimmy Carter",
      "Ronald Reagan",
      "George H. W. Bush",
      "Joe Biden",
      "Lyndon B. Johnson",
    ],

    otherPresidentThings: [
      {
        "Richard Nixon":
          "Resigned in August 1974 amid the Watergate scandal; lived in seclusion in California and later wrote memoirs; rarely commented publicly during Ford’s presidency.",
      },
      {
        "Jimmy Carter":
          "Began his campaign for the Democratic nomination shortly after Ford took office; ran as a Washington outsider and defeated Ford in the 1976 election.",
      },
      {
        "Ronald Reagan":
          "Finished his second term as Governor of California in 1975; challenged Ford for the Republican nomination in 1976, nearly winning it and cementing his national profile.",
      },
      {
        "George H. W. Bush":
          "Served as U.S. envoy to China and later as Director of the CIA (appointed by Ford in 1976); continued rising in national Republican politics.",
      },
      {
        "Joe Biden":
          "Served as a freshman U.S. Senator from Delaware; focused on judiciary and foreign relations issues; known for his moderate Democratic stance.",
      },
      {
        "Lyndon B. Johnson":
          "Deceased — died in January 1973, prior to Ford becoming president.",
      },
    ],
  },
  {
    name: "Jimmy Carter",
    status: "dead",
    birthYear: 1924,
    birthPlace: "Plains, Georgia",
    parents: "James Earl Carter Sr. and Lillian Gordy Carter",
    deathYear: 2024,
    deathPlace: "Plains, Georgia",
    deathReason: "Metastatic melanoma",
    presidencyStart: 1977,
    presidencyEnd: 1981,
    keyPolicies: 13,
    policies: [
      "Camp David Accords (1978) : Negotiated a peace agreement between Egypt and Israel, leading to Egypt recognizing Israel and ending hostilities between the two nations.",
      "Department of Energy Creation (1977) : Established the Department of Energy to address the energy crisis and promote alternative energy sources.",
      "National Energy Act (1978) : Implemented policies to reduce U.S. dependence on foreign oil and encourage energy conservation.",
      "Iran Hostage Crisis (1979-1981) : Faced a diplomatic crisis when Iranian militants took 52 American hostages for 444 days, significantly weakening his presidency.",
      "Panama Canal Treaties (1977) : Signed treaties to gradually transfer control of the Panama Canal from the U.S. to Panama by 1999.",
      "Deregulation of Airlines (Airline Deregulation Act, 1978) : Ended government control over airline fares and routes, increasing competition and lowering airfares.",
      "Deregulation of Trucking and Railroads (Motor Carrier Act, 1980) : Reduced government control over the transportation industry to encourage competition and efficiency.",
      "SALT II Treaty (1979) : Negotiated a nuclear arms control treaty with the Soviet Union, but it was never ratified due to the Soviet invasion of Afghanistan.",
      "Response to Soviet Invasion of Afghanistan (1979) : Imposed economic sanctions on the Soviet Union and boycotted the 1980 Moscow Olympics.",
      "Superfund Law (Comprehensive Environmental Response, Compensation, and Liability Act, 1980) : Created a fund to clean up hazardous waste sites and protect the environment.",
      "Expansion of Human Rights Policies : Made human rights a central focus of U.S. foreign policy, pressuring authoritarian governments.",
      "Appointment of Paul Volcker as Federal Reserve Chairman (1979) : Supported high interest rate policies to combat inflation, leading to economic recession but long-term stability.",
      "Civil Service Reform Act (1978) : Overhauled the federal hiring and management system to improve government efficiency.",
    ],
    party: "Democratic",
    spouse: "Rosalynn Carter",
    children: "4",
    occupationBeforePresidency: "Farmer and Politician",
    quote:
      "We must adjust to changing times and still hold to unchanging principles.",
    image: "images/JimmyCarter.png",
    otherPresidents: [
      "Gerald Ford",
      "Richard Nixon",
      "Ronald Reagan",
      "George H. W. Bush",
      "Joe Biden",
    ],

    otherPresidentThings: [
      {
        "Gerald Ford":
          "In retirement after losing the 1976 election; maintained a moderate Republican voice and occasionally commented on Carter’s foreign and domestic policies.",
      },
      {
        "Richard Nixon":
          "Continued to rebuild his public image post-Watergate; traveled abroad and met with foreign leaders; wrote extensively on foreign policy.",
      },
      {
        "Ronald Reagan":
          "Prepared for a second presidential run; became the leading conservative voice in the Republican Party and formally announced his candidacy in 1979.",
      },
      {
        "George H. W. Bush":
          "Served as Director of the CIA until 1977; remained active in Republican politics and began campaigning for the 1980 presidential nomination.",
      },
      {
        "Joe Biden":
          "Serving in the U.S. Senate; worked on key judiciary and foreign relations issues; gained attention as a young, articulate Democratic voice.",
      },
    ],
  },
  {
    name: "Ronald Reagan",
    terms: 2,
    status: "dead",
    birthYear: 1911,
    birthPlace: "Tampico, Illinois",
    parents: "John Reagan and Nelle Wilson Reagan",
    deathYear: 2004,
    deathPlace: "Los Angeles, California",
    deathReason: "Pneumonia due to Alzheimer's disease",
    presidencyStart: 1981,
    presidencyEnd: 1989,
    keyPolicies: 16,
    policies: [
      "Reaganomics (1981-1989) : Economic policies focused on tax cuts, deregulation, and reducing government spending to encourage growth.",
      "Economic Recovery Tax Act (1981) : Cut income tax rates across all brackets, with the highest tax rate dropping from 70% to 50%.",
      "Tax Reform Act of 1986 : Simplified the tax code, lowered corporate tax rates, and eliminated many deductions.",
      "Deregulation of Industries : Reduced federal regulations on banking, telecommunications, and transportation to promote business growth.",
      "Increased Defense Spending : Expanded the U.S. military budget significantly to counter Soviet influence during the Cold War.",
      "Strategic Defense Initiative (SDI) (1983) : Proposed a missile defense system (nicknamed 'Star Wars') to protect the U.S. from nuclear attacks.",
      "Cold War Policies & Soviet Confrontation : Took a tough stance against the USSR, calling it the 'Evil Empire' and increasing military pressure.",
      "INF Treaty (1987) : Signed the Intermediate-Range Nuclear Forces Treaty with the Soviet Union to eliminate certain nuclear weapons.",
      "War on Drugs (1980s) : Expanded anti-drug policies, increasing penalties for drug offenses and launching the 'Just Say No' campaign.",
      "Iran-Contra Affair (1986) : Controversial secret arms sale to Iran, with proceeds used to fund anti-communist rebels in Nicaragua, leading to a major scandal.",
      "Social Security Reform (1983) : Increased payroll taxes and raised the retirement age to ensure long-term Social Security stability.",
      "Immigration Reform and Control Act (1986) : Granted amnesty to nearly 3 million undocumented immigrants while tightening border security.",
      "Civil Liberties and the Conservative Movement : Shifted the Supreme Court to the right by appointing conservative justices, including Sandra Day O’Connor, the first female justice.",
      "Challenger Disaster Response (1986) : Addressed the nation after the Space Shuttle Challenger explosion, reinforcing commitment to space exploration.",
      "Savings and Loan Crisis (Late 1980s) : Deregulated financial institutions, leading to a banking crisis that required a government bailout.",
      "End of Cold War Foundations : Built diplomatic relations with Soviet leader Mikhail Gorbachev, helping lay the groundwork for the collapse of the USSR.",
    ],
    party: "Republican",
    spouse: "Nancy Davis Reagan",
    children: "2",
    occupationBeforePresidency: "Actor and Politician",
    quote: "Freedom is never more than one generation away from extinction.",
    image: "images/RonaldReagan.png",
    otherPresidents: [
      "Gerald Ford",
      "Richard Nixon",
      "Ronald Reagan",
      "George H. W. Bush",
      "Joe Biden",
    ],

    otherPresidentThings: [
      {
        "Gerald Ford":
          "In retirement after losing the 1976 election; maintained a moderate Republican voice and occasionally commented on Carter’s foreign and domestic policies.",
      },
      {
        "Richard Nixon":
          "Continued to rebuild his public image post-Watergate; traveled abroad and met with foreign leaders; wrote extensively on foreign policy.",
      },
      {
        "Ronald Reagan":
          "Prepared for a second presidential run; became the leading conservative voice in the Republican Party and formally announced his candidacy in 1979.",
      },
      {
        "George H. W. Bush":
          "Served as Director of the CIA until 1977; remained active in Republican politics and began campaigning for the 1980 presidential nomination.",
      },
      {
        "Joe Biden":
          "Serving in the U.S. Senate; worked on key judiciary and foreign relations issues; gained attention as a young, articulate Democratic voice.",
      },
    ],
  },
  {
    name: "George H. W. Bush",
    status: "dead",
    birthYear: 1924,
    birthPlace: "Milton, Massachusetts",
    parents: "Prescott Bush and Dorothy Walker Bush",
    deathYear: 2018,
    deathPlace: "Houston, Texas",
    deathReason: "Parkinson's disease",
    presidencyStart: 1989,
    presidencyEnd: 1993,
    keyPolicies: 14,
    policies: [
      "Americans with Disabilities Act (1990) : Prohibited discrimination against individuals with disabilities in employment, public accommodations, and transportation.",
      "Clean Air Act Amendments (1990) : Strengthened environmental regulations to reduce air pollution, acid rain, and ozone depletion.",
      "Strategic Arms Reduction Treaty (START I) (1991) : Signed a nuclear arms reduction treaty with the Soviet Union to decrease both countries' nuclear arsenals.",
      "End of the Cold War (1989-1991) : Oversaw the collapse of the Soviet Union and the peaceful end of the Cold War.",
      "Persian Gulf War (1991) : Led a U.S.-coalition military operation (Operation Desert Storm) to expel Iraqi forces from Kuwait.",
      "Invasion of Panama (1989) : Ordered the removal of Panamanian dictator Manuel Noriega for drug trafficking and threats to U.S. citizens.",
      "Budget Enforcement Act (1990) : Raised taxes and implemented spending controls to reduce the federal deficit, breaking his 'no new taxes' pledge.",
      "North American Free Trade Agreement (NAFTA) Negotiations : Initiated NAFTA discussions, paving the way for free trade between the U.S., Canada, and Mexico (signed under Clinton).",
      "Immigration Act of 1990 : Increased legal immigration limits and created new visa categories for skilled workers and diversity immigrants.",
      "Education Goals 2000 Initiative : Established national education goals to improve student achievement and accountability in schools.",
      "Disaster Relief Act Expansion : Improved federal response to natural disasters, including Hurricane Andrew in 1992.",
      "Civil Rights Act of 1991 : Strengthened protections against workplace discrimination based on race, gender, and disability.",
      "Energy Policy Act (1992) : Promoted energy efficiency, renewable energy, and the development of alternative fuels.",
      "Los Angeles Riots Response (1992) : Deployed federal troops to restore order after the Rodney King verdict led to civil unrest.",
    ],
    party: "Republican",
    spouse: "Barbara Pierce Bush",
    children: "6",
    occupationBeforePresidency: "Politician and Businessman",
    quote: "We are not the sum of our possessions.",
    image: "images/GeorgeHWBush.png",
    otherPresidents: [
      "Ronald Reagan",
      "Jimmy Carter",
      "Gerald Ford",
      "Richard Nixon",
      "Joe Biden",
      "Bill Clinton",
      "George W. Bush",
    ],

    otherPresidentThings: [
      {
        "Ronald Reagan":
          "In retirement after completing his two terms; largely stayed out of politics but remained an influential figure within the Republican Party; diagnosed with Alzheimer’s shortly after Bush’s term ended.",
      },
      {
        "Jimmy Carter":
          "Continued humanitarian work through the Carter Center; frequently voiced opinions on foreign policy, human rights, and criticized aspects of Bush’s Gulf War strategy.",
      },
      {
        "Gerald Ford":
          "Remained an elder statesman; offered private political advice and supported Bush’s 1988 campaign; gave occasional speeches on governance and bipartisanship.",
      },
      {
        "Richard Nixon":
          "Continued writing and advising on foreign policy; praised Bush’s diplomatic handling of the end of the Cold War and the Gulf War.",
      },
      {
        "Joe Biden":
          "Served in the U.S. Senate; played a major role in foreign policy and judicial matters; supported some aspects of Bush’s foreign policy but was a Democratic critic on domestic issues.",
      },
      {
        "Bill Clinton":
          "Governor of Arkansas; gained national attention as a rising Democratic star; launched a successful presidential campaign in 1992, defeating Bush.",
      },
      {
        "George W. Bush":
          "Involved in business and served as managing partner of the Texas Rangers baseball team; began preparing for a political career, eventually running for Governor of Texas in 1994.",
      },
    ],
  },
  {
    name: "Bill Clinton",
    terms: 2,
    status: "alive",
    birthYear: 1946,
    birthPlace: "Hope, Arkansas",
    parents: "William Jefferson Blythe Jr. and Virginia Dell Cassidy",
    deathYear: "",
    deathPlace: "N/A",
    deathReason: "N/A",
    presidencyStart: 1993,
    presidencyEnd: 2001,
    keyPolicies: 15,
    policies: [
      "North American Free Trade Agreement (NAFTA) (1993) : Signed into law a trade agreement between the U.S., Canada, and Mexico, eliminating most tariffs and boosting trade.",
      "Welfare Reform (Personal Responsibility and Work Opportunity Reconciliation Act, 1996) : Overhauled welfare programs by setting work requirements and time limits on government assistance.",
      "Balanced Budget and Economic Growth (1993-2001) : Led to a budget surplus by cutting deficits, increasing taxes on higher incomes, and growing the economy.",
      "Crime Bill (Violent Crime Control and Law Enforcement Act, 1994) : Increased police funding, expanded the death penalty, and implemented a federal 'three strikes' law.",
      "Family and Medical Leave Act (1993) : Guaranteed employees up to 12 weeks of unpaid leave for family or medical emergencies.",
      "Children’s Health Insurance Program (CHIP) (1997) : Expanded healthcare coverage for low-income children through federal and state partnerships.",
      "Defense of Marriage Act (DOMA) (1996) : Defined marriage as between a man and a woman for federal purposes, later ruled unconstitutional.",
      "Brady Handgun Violence Prevention Act (1993) : Imposed background checks and waiting periods for handgun purchases.",
      "Repeal of Glass-Steagall Act (Gramm-Leach-Bliley Act, 1999) : Removed financial regulations separating commercial and investment banks, later blamed for contributing to the 2008 financial crisis.",
      "Digital Millennium Copyright Act (DMCA) (1998) : Strengthened intellectual property protections in the digital era.",
      "Dayton Accords (1995) : Led NATO intervention in Bosnia to end the civil war and ethnic cleansing in the region.",
      "Kosovo Intervention (1999) : Ordered NATO airstrikes to stop Serbian aggression against ethnic Albanians in Kosovo.",
      "Expansion of NATO (1999) : Brought Poland, Hungary, and the Czech Republic into NATO, strengthening U.S. influence in Eastern Europe.",
      "China Trade Relations (2000) : Signed a bill granting China Permanent Normal Trade Relations (PNTR), paving the way for its entry into the World Trade Organization.",
      "Impeachment (1998-1999) : Impeached by the House of Representatives for perjury and obstruction of justice related to the Monica Lewinsky scandal but was acquitted by the Senate.",
    ],
    party: "Democratic",
    spouse: "Hillary Clinton",
    children: "1",
    occupationBeforePresidency: "Politician and Lawyer",
    quote:
      "There is nothing wrong with America that cannot be cured by what is right with America.",
    image: "images/BillClinton.png",
    otherPresidents: [
      "George H. W. Bush",
      "Ronald Reagan",
      "Jimmy Carter",
      "Richard Nixon",
      "Joe Biden",
      "George W. Bush",
      "Barack Obama",
    ],

    otherPresidentThings: [
      {
        "George H. W. Bush":
          "In retirement after losing the 1992 election; largely stayed out of the political spotlight, though he supported Republican candidates and focused on humanitarian work.",
      },
      {
        "Ronald Reagan":
          "Publicly announced his Alzheimer’s diagnosis in 1994 and withdrew from public life; remained a symbolic figure within the Republican Party.",
      },
      {
        "Jimmy Carter":
          "Continued active global humanitarian work and election monitoring through the Carter Center; occasionally critiqued U.S. foreign policy and offered support on health and housing issues.",
      },
      {
        "Richard Nixon":
          "Deceased — died in 1994; remained active in foreign policy commentary until his passing, and had praised Clinton for diplomatic outreach to Russia.",
      },
      {
        "Joe Biden":
          "Served in the U.S. Senate; continued shaping foreign relations and judiciary policy; supported Clinton’s crime bill and elements of his domestic agenda.",
      },
      {
        "George W. Bush":
          "Elected Governor of Texas in 1994; gained national attention for bipartisan leadership and education reform; built momentum for his 2000 presidential run.",
      },
      {
        "Barack Obama":
          "Worked as a community organizer, lawyer, and professor; elected to the Illinois State Senate in 1996, beginning his rise in Democratic politics.",
      },
    ],
  },
  {
    name: "George W. Bush",
    terms: 2,
    status: "alive",
    birthYear: 1946,
    birthPlace: "New Haven, Connecticut",
    parents: "George H. W. Bush and Barbara Bush",
    deathYear: "",
    deathPlace: "N/A",
    deathReason: "N/A",
    presidencyStart: 2001,
    presidencyEnd: 2009,
    keyPolicies: 15,
    policies: [
      "No Child Left Behind Act (2002) : Increased federal oversight of education, requiring standardized testing and accountability measures for schools.",
      "USA PATRIOT Act (2001) : Expanded government surveillance powers to combat terrorism after the 9/11 attacks.",
      "Department of Homeland Security Creation (2002) : Established a new federal department to coordinate national security efforts against terrorism.",
      "War on Terror (2001-2009) : Launched military campaigns in Afghanistan and Iraq to combat terrorism and promote democracy.",
      "Invasion of Afghanistan (2001) : Led U.S. forces to overthrow the Taliban regime after the 9/11 attacks.",
      "Invasion of Iraq (2003) : Ordered the U.S. invasion of Iraq, leading to the overthrow of Saddam Hussein and a prolonged military presence.",
      "Medicare Prescription Drug, Improvement, and Modernization Act (2003) : Created Medicare Part D, providing prescription drug coverage for senior citizens.",
      "Bush Tax Cuts (2001, 2003) : Reduced federal income tax rates across all brackets, including significant cuts for high-income earners.",
      "Emergency Economic Stabilization Act (2008) : Approved a $700 billion bailout to rescue failing financial institutions during the 2008 financial crisis.",
      "Hurricane Katrina Response (2005) : Faced criticism for the slow and ineffective federal response to the disaster.",
      "Partial-Birth Abortion Ban Act (2003) : Prohibited a specific late-term abortion procedure, marking a major victory for pro-life advocates.",
      "Energy Policy Act (2005) : Promoted domestic energy production, including oil drilling, ethanol use, and alternative energy incentives.",
      "Financial Regulations and Housing Crisis Response (2008) : Introduced measures to stabilize the economy after the subprime mortgage collapse.",
      "Great Recession (2007-2009) : Presided over the start of the worst economic downturn since the Great Depression, leading to major government interventions.",
      "U.S. Withdrawal Plan from Iraq (2008) : Signed an agreement with Iraq setting a timeline for U.S. troop withdrawals.",
    ],
    party: "Republican",
    spouse: "Laura Welch Bush",
    children: "2",
    occupationBeforePresidency: "Governor",
    quote: "We will not tire, we will not falter, and we will not fail.",
    image: "images/GeorgeWBush.png",
    otherPresidents: [
      "Bill Clinton",
      "George H. W. Bush",
      "Jimmy Carter",
      "Joe Biden",
      "Barack Obama",
      "Donald Trump",
    ],

    otherPresidentThings: [
      {
        "Bill Clinton":
          "Active globally through the Clinton Foundation; partnered with George H. W. Bush on disaster relief efforts; occasionally clashed with Bush administration over policy but maintained bipartisan cooperation on humanitarian efforts.",
      },
      {
        "George H. W. Bush":
          "In retirement; frequently partnered with Clinton on philanthropic causes; supported his son’s presidency while largely staying out of policy discussions.",
      },
      {
        "Jimmy Carter":
          "Continued humanitarian and diplomatic work through the Carter Center; publicly criticized aspects of Bush’s foreign policy, particularly the Iraq War.",
      },
      {
        "Joe Biden":
          "Served as a senior U.S. Senator; chaired the Senate Foreign Relations Committee; supported the Afghanistan War but became increasingly critical of the Iraq War.",
      },
      {
        "Barack Obama":
          "Served in the Illinois State Senate until 2004; elected to the U.S. Senate in 2004; gained national attention with his DNC speech and launched his presidential campaign in 2007.",
      },
      {
        "Donald Trump":
          "Known primarily as a businessman and television personality; frequently commented on politics and national issues, but had not yet entered public office during Bush’s presidency.",
      },
    ],
  },
  {
    name: "Barack Obama",
    terms: 2,
    status: "alive",
    birthYear: 1961,
    birthPlace: "Honolulu, Hawaii",
    parents: "Barack Obama Sr. and Stanley Ann Dunham",
    deathYear: "",
    deathPlace: "N/A",
    deathReason: "N/A",
    presidencyStart: 2009,
    presidencyEnd: 2017,
    keyPolicies: 16,
    policies: [
      "Affordable Care Act (Obamacare) (2010) : Expanded healthcare coverage, required insurance companies to cover pre-existing conditions, and created health insurance marketplaces.",
      "Dodd-Frank Wall Street Reform Act (2010) : Introduced financial regulations to prevent a repeat of the 2008 financial crisis by increasing oversight of banks and Wall Street.",
      "American Recovery and Reinvestment Act (2009) : Implemented a $787 billion economic stimulus package to combat the Great Recession through tax cuts, infrastructure projects, and job programs.",
      "Ending the War in Iraq (2011) : Completed the withdrawal of U.S. troops from Iraq, fulfilling a major campaign promise.",
      "Osama bin Laden Raid (2011) : Ordered the successful U.S. Navy SEAL operation that killed al-Qaeda leader Osama bin Laden.",
      "DREAM Act and DACA (2012) : Established Deferred Action for Childhood Arrivals (DACA) to protect undocumented immigrants who arrived as children from deportation.",
      "Paris Climate Agreement (2015) : Signed an international treaty committing the U.S. to reducing greenhouse gas emissions and combating climate change.",
      "Cuba-U.S. Relations Normalization (2014-2015) : Reestablished diplomatic relations with Cuba after decades of tension and trade embargoes.",
      "Iran Nuclear Deal (2015) : Negotiated an agreement to limit Iran’s nuclear program in exchange for lifting economic sanctions.",
      "Repeal of Don’t Ask, Don’t Tell (2010) : Allowed LGBTQ+ individuals to serve openly in the U.S. military.",
      "Marriage Equality Support : Appointed Supreme Court justices who contributed to the 2015 ruling legalizing same-sex marriage nationwide.",
      "Expansion of Student Loan Relief (2010-2014) : Introduced reforms to lower student loan interest rates and expand income-based repayment plans.",
      "Lilly Ledbetter Fair Pay Act (2009) : Strengthened equal pay protections for women and employees facing wage discrimination.",
      "Automotive Industry Bailout (2009) : Provided emergency funding to rescue General Motors and Chrysler, saving jobs in the auto industry.",
      "Gun Control Efforts (2013-2016) : Pushed for universal background checks and gun safety laws after mass shootings, though faced congressional opposition.",
      "Trans-Pacific Partnership (TPP) Negotiation (2016) : Negotiated a major trade deal with Pacific nations to counter China’s influence, though it was later scrapped under Trump.",
    ],
    party: "Democratic",
    spouse: "Michelle Obama",
    children: "2",
    occupationBeforePresidency: "Politician and Lawyer",
    quote: "Yes we can.",
    image: "images/BarackObama.png",
    otherPresidents: [
      "George W. Bush",
      "Bill Clinton",
      "George H. W. Bush",
      "Jimmy Carter",
      "Joe Biden",
      "Donald Trump",
    ],

    otherPresidentThings: [
      {
        "George W. Bush":
          "Retired from politics after leaving office in 2009; focused on painting and philanthropy; avoided criticizing Obama publicly and emphasized unity.",
      },
      {
        "Bill Clinton":
          "Remained highly active in global philanthropy via the Clinton Foundation; supported Hillary Clinton’s 2008 and 2016 presidential campaigns; collaborated with the Obama administration on health and global initiatives.",
      },
      {
        "George H. W. Bush":
          "In full retirement; partnered with Bill Clinton on humanitarian efforts; praised Obama's leadership after several national tragedies; died in 2018.",
      },
      {
        "Jimmy Carter":
          "Continued global peace and health initiatives; at times publicly disagreed with Obama’s drone policy and surveillance programs, but generally supported his presidency.",
      },
      {
        "Joe Biden":
          "Served as Obama’s Vice President; key figure in foreign policy, economic recovery, and legislative negotiations; awarded the Presidential Medal of Freedom in 2017.",
      },
      {
        "Donald Trump":
          "Criticized Obama frequently in media and on Twitter; rose as a prominent “birther” figure; launched his 2016 presidential campaign and won, succeeding Obama in 2017.",
      },
    ],
  },
  {
    name: "Donald Trump",
    status: "alive",
    birthYear: 1946,
    birthPlace: "Queens, New York City, New York",
    parents: "Fred Trump and Mary MacLeod Trump",
    deathYear: "",
    deathPlace: "N/A",
    deathReason: "N/A",
    presidencyStart: 2017,
    presidencyEnd: 2021,
    keyPolicies: 8,
    policies: [
      "Tax Cuts and Jobs Act (2017) : Implemented significant tax reforms, reducing corporate tax rates and altering individual income tax brackets.",
      "Deregulation Efforts : Rolled back numerous federal regulations across various sectors to promote business growth.",
      "Immigration Policies : Enforced stricter immigration laws, including the travel ban on certain countries and attempts to end DACA.",
      "Trade Policies : Imposed tariffs on imports from China and other countries to protect American industries.",
      "Criminal Justice Reform (First Step Act, 2018) : Enacted reforms aimed at reducing recidivism and improving prison conditions.",
      "Judicial Appointments : Appointed three Supreme Court justices and numerous federal judges, shifting the judiciary to a more conservative stance.",
      "COVID-19 Response : Implemented measures to address the pandemic, including travel restrictions and Operation Warp Speed to accelerate vaccine development.",
      "Middle East Policies : Recognized Jerusalem as Israel's capital and brokered normalization agreements between Israel and several Arab nations.",
    ],
    party: "Republican",
    spouse: "Melania Trump",
    children: "5",
    occupationBeforePresidency: "Businessman and TV Personality",
    quote: "The more you dream, the farther you get.",
    otherPresidents: [
      "Barack Obama",
      "George W. Bush",
      "Bill Clinton",
      "Jimmy Carter",
      "Joe Biden",
    ],

    otherPresidentThings: [
      {
        "Barack Obama":
          "Remained largely silent during the early Trump years, but later became more vocal in defending democratic norms and endorsing Democratic candidates; campaigned actively for Joe Biden in 2020.",
      },
      {
        "George W. Bush":
          "Largely stayed out of politics; spoke out against political division and extremism; emphasized national unity and democratic values in contrast to Trump’s tone.",
      },
      {
        "Bill Clinton":
          "Continued to lead the Clinton Foundation and support Democratic causes; backed Hillary Clinton’s 2016 campaign and later Joe Biden’s 2020 run; offered limited public commentary during Trump’s term.",
      },
      {
        "Jimmy Carter":
          "Remained focused on humanitarian work through the Carter Center; voiced concerns about democratic backsliding and voter suppression during Trump’s presidency.",
      },
      {
        "Joe Biden":
          "Announced his candidacy in 2019; campaigned as a unifying alternative to Trump; elected in 2020 and succeeded Trump in January 2021.",
      },
    ],
  },
  {
    name: "Joe Biden",
    status: "alive",
    birthYear: 1942,
    birthPlace: "Scranton, Pennsylvania",
    parents: "Joseph R. Biden Sr. and Catherine Eugenia Finnegan Biden",
    deathYear: "",
    deathPlace: "N/A",
    deathReason: "N/A",
    presidencyStart: 2021,
    presidencyEnd: 2025,
    keyPolicies: 15,
    policies: [
      "American Rescue Plan Act (2021) : Enacted a $1.9 trillion stimulus package to address the economic impact of the COVID-19 pandemic, providing direct payments to individuals, extending unemployment benefits, and funding vaccine distribution.",
      "Infrastructure Investment and Jobs Act (2021) : Signed into law a $1 trillion bipartisan infrastructure bill to modernize transportation, utilities, and broadband infrastructure across the United States.",
      "Inflation Reduction Act (2022) : Passed legislation focusing on deficit reduction, climate change initiatives, healthcare subsidies, and tax reforms, aiming to lower greenhouse gas emissions and reduce prescription drug costs.",
      "Paris Climate Agreement Reentry (2021) : Rejoined the international accord to combat climate change, committing the U.S. to reduce greenhouse gas emissions and promote global environmental initiatives.",
      "Afghanistan Withdrawal (2021) : Ordered the complete withdrawal of U.S. troops from Afghanistan, ending America's longest war but facing criticism over the chaotic evacuation process.",
      "COVID-19 Vaccination Campaign : Launched a nationwide effort to distribute and administer vaccines, achieving significant milestones in vaccination rates to combat the pandemic.",
      "Student Loan Relief : Extended pauses on federal student loan repayments and explored forgiveness options for borrowers, aiming to alleviate financial burdens on students.",
      "Executive Actions on Racial Equity : Issued orders to address systemic racism and promote equity across federal agencies, including reforms in housing, criminal justice, and economic opportunities.",
      "Gun Control Measures : Advocated for enhanced background checks, assault weapon bans, and community violence intervention programs to address rising gun violence.",
      "Immigration Policies : Proposed comprehensive immigration reform, including pathways to citizenship for undocumented immigrants and changes to asylum procedures.",
      "Healthcare Initiatives : Strengthened the Affordable Care Act by increasing subsidies and expanding enrollment periods to improve healthcare access.",
      "Economic Policies : Implemented measures to boost job growth, support small businesses, and increase the federal minimum wage to stimulate economic recovery.",
      "Foreign Policy Shifts : Emphasized diplomacy by reengaging with allies, addressing challenges posed by China and Russia, and promoting democratic values globally.",
      "Education Funding : Increased investments in public education, proposed universal pre-K, and supported initiatives to make community college tuition-free.",
      "Climate Change Actions : Set ambitious goals for renewable energy adoption, electric vehicle promotion, and conservation efforts to address environmental concerns.",
    ],
    party: "Democratic",
    spouse: "Jill Biden",
    children: "4",
    occupationBeforePresidency: "Politician and Lawyer",
    quote: "Our best days still lie ahead.",
    otherPresidents: [
      "Donald Trump",
      "Barack Obama",
      "George W. Bush",
      "Bill Clinton",
      "Jimmy Carter",
    ],

    otherPresidentThings: [
      {
        "Donald Trump":
          "Left office in January 2021 after refusing to concede the 2020 election; remained a dominant force in the Republican Party; impeached a second time following the January 6 Capitol attack; launched a 2024 presidential campaign.",
      },
      {
        "Barack Obama":
          "Maintained a strong public presence through speeches, writing, and the Obama Foundation; supported Biden’s agenda and campaigned with Democrats in key elections.",
      },
      {
        "George W. Bush":
          "Continued his focus on painting and veteran causes; offered limited but pointed criticism of political extremism and threats to democracy.",
      },
      {
        "Bill Clinton":
          "Largely retired from public life; remained involved in global initiatives via the Clinton Foundation and occasionally appeared at political events.",
      },
      {
        "Jimmy Carter":
          "Entered hospice care in 2023 after years of humanitarian work; widely honored for his lifelong service; holds the record as the longest-living U.S. president.",
      },
    ],
  },
  {
    name: "Donald Trump",
    status: "alive",
    birthYear: 1946,
    birthPlace: "Queens, New York City, New York",
    parents: "Fred Trump and Mary MacLeod Trump",
    deathYear: "",
    deathPlace: "N/A",
    deathReason: "N/A",
    presidencyStart: 2025,
    presidencyEnd: "Current President",
    keyPolicies: 3,
    policies: ["a:b", "c:d", "e:f"],
    party: "Republican",
    spouse: "Melania Trump",
    children: "5",
    occupationBeforePresidency: "Businessman and TV Personality",
    quote: "The more you dream, the farther you get.",
  },
]);
