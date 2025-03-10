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
    keyPolicies: 6,
    party: "None",
    spouse: "Martha Custis",
    children: "None",
    occupationBeforePresidency: "Farmer and Soldier",
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
    keyPolicies: 16,
    party: "Federalist",
    spouse: "Abigail Adams",
    children: "None",
    occupationBeforePresidency: "Lawyer",
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
    party: "Democratic-Republican",
    spouse: "Martha Wayles Skelton Jefferson",
    children: "None",
    occupationBeforePresidency: "Planter and Lawyer",
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
    party: "Democratic-Republican",
    spouse: "Dolley Payne Todd Madison",
    children: "None",
    occupationBeforePresidency: "Farmer and Politician",
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
    keyPolicies: 10,
    party: "Democratic-Republican",
    spouse: "Elizabeth Kortright Monroe",
    children: "3",
    occupationBeforePresidency: "Lawyer and Soldier",
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
    party: "Democratic-Republican",
    spouse: "Louisa Catherine Johnson Adams",
    children: "4",
    occupationBeforePresidency: "Diplomat and Lawyer",
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
    keyPolicies: 12,
    party: "Democratic",
    spouse: "Rachel Donelson Robards Jackson",
    children: "None",
    occupationBeforePresidency: "Lawyer and Military Leader",
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
    party: "Democratic",
    spouse: "Hannah Hoes Van Buren",
    children: "5",
    occupationBeforePresidency: "Lawyer and Politician",
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
    keyPolicies: 3,
    party: "Whig",
    spouse: "Anna Tuthill Symmes Harrison",
    children: "10",
    occupationBeforePresidency: "Military Officer and Politician",
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
    keyPolicies: 5,
    party: "Whig",
    spouse: "Letitia Christian Tyler",
    children: "8",
    occupationBeforePresidency: "Lawyer and Politician",
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
    keyPolicies: 9,
    party: "Democratic",
    spouse: "Sarah Childress Polk",
    children: "None",
    occupationBeforePresidency: "Lawyer",
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
    keyPolicies: 4,
    party: "Whig",
    spouse: "Margaret Mackall Smith Taylor",
    children: "6",
    occupationBeforePresidency: "Military Officer",
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
    keyPolicies: 6,
    party: "Whig",
    spouse: "Abigail Powers Fillmore",
    children: "2",
    occupationBeforePresidency: "Lawyer",
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
    keyPolicies: 7,
    party: "Democratic",
    spouse: "Jane Means Appleton Pierce",
    children: "3",
    occupationBeforePresidency: "Lawyer and Politician",
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
    keyPolicies: 6,
    party: "Democratic",
    spouse: "None",
    children: "None",
    occupationBeforePresidency: "Diplomat and Lawyer",
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
    keyPolicies: 13,
    party: "Republican",
    spouse: "Mary Todd Lincoln",
    children: "4",
    occupationBeforePresidency: "Lawyer",
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
    keyPolicies: 6,
    party: "National Union",
    spouse: "Eliza McCardle Johnson",
    children: "5",
    occupationBeforePresidency: "Tailor and Politician",
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
    keyPolicies: 10,
    party: "Republican",
    spouse: "Julia Dent Grant",
    children: "4",
    occupationBeforePresidency: "Military Leader",
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
    party: "Republican",
    spouse: "Lucy Webb Hayes",
    children: "8",
    occupationBeforePresidency: "Lawyer and Politician",
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
    keyPolicies: 2,
    party: "Republican",
    spouse: "Lucretia Rudolph Garfield",
    children: "7",
    occupationBeforePresidency: "Military Leader and Politician",
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
    keyPolicies: 6,
    party: "Republican",
    spouse: "Ellen Lewis Herndon Arthur",
    children: "3",
    occupationBeforePresidency: "Lawyer",
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
    keyPolicies: 7,
    party: "Democratic",
    spouse: "Frances Folsom Cleveland",
    children: "5",
    occupationBeforePresidency: "Lawyer and Politician",
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
    party: "Republican",
    spouse: "Caroline Lavinia Scott Harrison",
    children: "1",
    occupationBeforePresidency: "Lawyer and Politician",
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
    keyPolicies: 9,
    party: "Republican",
    spouse: "Ida Saxton McKinley",
    children: "2",
    occupationBeforePresidency: "Military Officer and Politician",
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
    keyPolicies: 12,
    party: "Republican",
    spouse: "Edith Kermit Carow Roosevelt",
    children: "6",
    occupationBeforePresidency: "Military Leader and Politician",
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
    keyPolicies: 8,
    party: "Republican",
    spouse: "Helen Herron Taft",
    children: "3",
    occupationBeforePresidency: "Judge and Politician",
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
    keyPolicies: 15,
    party: "Democratic",
    spouse: "Ellen Louise Axson Wilson",
    children: "3",
    occupationBeforePresidency: "Politician and Academic",
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
    keyPolicies: 6,
    party: "Republican",
    spouse: "Florence Kling Harding",
    children: "1",
    occupationBeforePresidency: "Newspaper Publisher",
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
    keyPolicies: 7,
    party: "Republican",
    spouse: "Grace Anna Goodhue Coolidge",
    children: "2",
    occupationBeforePresidency: "Lawyer and Politician",
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
    keyPolicies: 6,
    party: "Republican",
    spouse: "Lou Henry Hoover",
    children: "2",
    occupationBeforePresidency: "Engineer and Politician",
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
    keyPolicies: 15,
    party: "Democratic",
    spouse: "Eleanor Roosevelt",
    children: "6",
    occupationBeforePresidency: "Politician and Lawyer",
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
    keyPolicies: 9,
    party: "Democratic",
    spouse: "Bess Wallace Truman",
    children: "1",
    occupationBeforePresidency: "Politician and Farmer",
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
    keyPolicies: 12,
    party: "Republican",
    spouse: "Mamie Geneva Doud Eisenhower",
    children: "2",
    occupationBeforePresidency: "Military Leader",
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
    keyPolicies: 10,
    party: "Democratic",
    spouse: "Jacqueline Bouvier Kennedy",
    children: "4",
    occupationBeforePresidency: "Politician and Author",
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
    keyPolicies: 12,
    party: "Democratic",
    spouse: "Lady Bird Johnson",
    children: "2",
    occupationBeforePresidency: "Politician and Teacher",
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
    keyPolicies: 11,
    party: "Republican",
    spouse: "Pat Nixon",
    children: "2",
    occupationBeforePresidency: "Politician and Lawyer",
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
    keyPolicies: 8,
    party: "Republican",
    spouse: "Betty Ford",
    children: "4",
    occupationBeforePresidency: "Politician and Lawyer",
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
    keyPolicies: 10,
    party: "Democratic",
    spouse: "Rosalynn Carter",
    children: "4",
    occupationBeforePresidency: "Farmer and Politician",
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
    keyPolicies: 15,
    party: "Republican",
    spouse: "Nancy Davis Reagan",
    children: "2",
    occupationBeforePresidency: "Actor and Politician",
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
    party: "Republican",
    spouse: "Barbara Pierce Bush",
    children: "6",
    occupationBeforePresidency: "Politician and Businessman",
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
    party: "Democratic",
    spouse: "Hillary Clinton",
    children: "1",
    occupationBeforePresidency: "Politician and Lawyer",
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
    keyPolicies: 13,
    party: "Republican",
    spouse: "Laura Welch Bush",
    children: "2",
    occupationBeforePresidency: "Governor",
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
    keyPolicies: 17,
    party: "Democratic",
    spouse: "Michelle Obama",
    children: "2",
    occupationBeforePresidency: "Politician and Lawyer",
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
    keyPolicies: 12,
    party: "Republican",
    spouse: "Melania Trump",
    children: "5",
    occupationBeforePresidency: "Businessman and TV Personality",
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
    keyPolicies: 8,
    party: "Democratic",
    spouse: "Jill Biden",
    children: "4",
    occupationBeforePresidency: "Politician and Lawyer",
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
    keyPolicies: 12,
    party: "Republican",
    spouse: "Melania Trump",
    children: "5",
    occupationBeforePresidency: "Businessman and TV Personality",
  },
]);
