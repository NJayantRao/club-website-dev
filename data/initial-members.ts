export interface MemberSocial {
  platform: "github" | "linkedin" | "website" | string;
  url: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  section: "advisor" | "core" | "alumni";
  image: string;
  socials?: MemberSocial[];
}

export const advisors = [
  {
    name: "Swetanjali Mahrana",
    role: "Assistant Professor",
    img: "swetanjali.jpg",
    color: "blue",
  },
  {
    name: "Bandhan Panda",
    role: "Assistant Professor",
    img: "bandhan.jpg",
    color: "blue",
  },
];

export const members = [
  { name: "Payal", role: "Core Member", img: "payaljr.jpg" },
  { name: "Govinda", role: "Core Member", img: "Govindajr.jpg" },
  { name: "Rudransh", role: "Core Member", img: "rudranshjr.jpg" },
  { name: "Gaurav Tiwari", role: "Core Member", img: "gauravjr.jpg" },
  { name: "Abhimanyu", role: "Core Member", img: "Abhimanyujr.jpg" },
  { name: "Sriya", role: "Core Member", img: "usriyareddyjr.jpg" },
  { name: "Sruti", role: "Core Member", img: "srutiprustyjr.jpg" },
  { name: "Priya", role: "Core Member", img: "Priyapatrajr.jpg" },
  { name: "Sudip", role: "Core Member", img: "Sudipdasjr.jpg" },
  { name: "Rudra", role: "Core Member", img: "Rudrajr.jpg" },
  { name: "Aman", role: "Core Member", img: "amanjr.jpg" },
  { name: "Srikant", role: "Core Member", img: "srikantjr.jpg" },
  { name: "Mohammad Ehsan", role: "Core Member", img: "eshanjr.jpg" },
  { name: "Sai Kalyan", role: "Core Member", img: "Ksaikalyanjr.jpg" },
  {
    name: "Disha",
    role: "Core Member",
    img: "disha.jpg",
    linkedin: "https://www.linkedin.com/in/disha-rani-dash-74409b2b5",
  },
  {
    name: "Sweta Gupta",
    role: "Core Member",
    img: "sweta.jpg",
    linkedin: "https://www.linkedin.com/in/sweta-gupta-67386b282",
  },
  {
    name: "Renisha Parui",
    role: "Core Member",
    img: "renisa.jpg",
    linkedin: "https://www.linkedin.com/in/renisha-p-3b264a263/",
  },
  {
    name: "Abhisekh Padhy",
    role: "Core Member",
    img: "abhishek.jpg",
    linkedin: "https://www.linkedin.com/in/abhisekh-padhy-7374011b6",
  },
  {
    name: "Biraja",
    role: "Core Member",
    img: "biraja.jpg",
    linkedin: "https://www.linkedin.com/in/biraja-nayak-993960310",
  },
  {
    name: "Samiksha Mohapatra",
    role: "Core Member",
    img: "samiksha.jpg",
    linkedin: "https://www.linkedin.com/in/samiksha-mohapatra-a34517334/",
  },
  {
    name: "Akash Kumar",
    role: "Core Member",
    img: "akash.jpg",
    linkedin: "https://www.linkedin.com/in/akash-kumar-17576132b",
  },
  {
    name: "Sujata Kumari",
    role: "Core Member",
    img: "sujata.jpg",
    linkedin: "https://www.linkedin.com/in/sujata-kumari-44779b316/",
  },
  {
    name: "Ashutosh Nayak",
    role: "Core Member",
    img: "ashutoshnayak.jpg",
    linkedin: "https://www.linkedin.com/in/ashutosh-nayak-749ab4222",
  },
  {
    name: "Tadvab Pradhan",
    role: "Core Member",
    img: "tadvab.jpg",
    linkedin: "https://www.linkedin.com/in/tadvab-pradhan-97a976300",
  },
  {
    name: "Riya Suman Padhy",
    role: "Core Member",
    img: "riya.jpg",
    linkedin: "https://www.linkedin.com/in/riya-padhy-139397330",
  },
  {
    name: "Amitanshu Sahu",
    role: "Core Member",
    img: "amitanshu.jpg",
    linkedin: "https://www.linkedin.com/in/amitanshusahu/",
  },
  {
    name: "K Swagat Kumar",
    role: "Core Member",
    img: "swagat.jpg",
    linkedin: "https://www.linkedin.com/in/k-swagat-kumar-919046210/",
  },
  {
    name: "sai sarthak sadangi",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/sai-sarthak-sadangi/",
  },
  {
    name: "Ashmita Maharana",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/ashmita-maharana/",
  },
  {
    name: "N Jayant Rao",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/n-jayant-rao-093036315",
  },
  {
    name: "Md Amanullah",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/md-amanullah-79523224b/",
  },
  {
    name: "Ayush Kumar Gupta",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/ayush-kumar-gupta-a1450a324/",
  },
  {
    name: "D.Jyothika",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/d-jyothika-2b5734332",
  },
  {
    name: "Puja Pradhan",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/puja-pradhan-34ba2b248",
  },
  {
    name: "Vineet Patnaik",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/vineet-patnaik-76857436b/",
  },
  {
    name: "Ansuman Padhy",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/ansuman-padhy-7603b5322/",
  },
  {
    name: "Koustubha pathy",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/koustubha-pathy-758243332",
  },
  {
    name: "M.Roshni Princy",
    role: "Core Member",
    img: "avatar.png",
    linkedin:
      "https://www.linkedin.com/in/m-roshni-princy-ba517a358?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
  },
  {
    name: "Aditya kumar Rath",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/aditya-kumar-rath-849aa5309",
  },
  {
    name: "Rajiv dey",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/rajiv-dey-6b4033307",
  },
  {
    name: "Yagyashini Bhagat",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/yagyashini-bhagat-18151a332",
  },
  {
    name: "Rishav Kumar Singh",
    role: "Core Member",
    img: "avatar.png",
    linkedin: "https://www.linkedin.com/in/rishav-kumar-singh-81a69433b",
  },
];

export const alumni = [
  { name: "Anwesh", role: "Club Alumni", img: "anwesh.jpg" },
  { name: "Mayank", role: "Club Alumni", img: "mayank.jpg" },
  { name: "SOUMIK BERA", role: "Club Alumni", img: "soumik.jpg" },
  { name: "Bishal", role: "Club Alumni", img: "bishal.jpg" },
  { name: "Akshat", role: "Club Alumni", img: "akshat.jpg" },
  { name: "Naveen", role: "Club Alumni", img: "naveen.jpg" },
  { name: "Abhinav", role: "Club Alumni", img: "abhinav.jpg" },
  { name: "Rahul Kumar", role: "Club Alumni", img: "rahul.jpg" },
  { name: "Gourav", role: "Club Alumni", img: "gourav.jpg" },
  { name: "Asutosh", role: "Club Alumni", img: "ashutosh.png" },
  { name: "Ashutosh Biswal", role: "Club Alumni", img: "ashutoshbiswal.jpg" },
  { name: "Adil Zamal", role: "Club Alumni", img: "adil.jpg" },
  { name: "Rishav Kumar", role: "Club Alumni", img: "RishavKumar.jpg" },
  { name: "Asish Patnaik", role: "Club Alumni", img: "asishpatnaik.jpg" },
  { name: "Aryan Asgar", role: "Club Alumni", img: "aryan.jpg" },
  { name: "Chiranjeeb Nayak", role: "Club Alumni", img: "chiranjeeb.jpg" },
  { name: "K Nandini Dora", role: "Club Alumni", img: "nandini.jpg" },
  { name: "Nikhil Kumar Singh", role: "Club Alumni", img: "nikhil.jpg" },
  { name: "Ritik Kumar Kapsime", role: "Club Alumni", img: "ritik.jpg" },
  { name: "Sanat Dash", role: "Club Alumni", img: "sanat.jpg" },
  { name: "Sushovan Paul", role: "Club Alumni", img: "sushovan.jpg" },
  { name: "Sunny Kumar", role: "Club Alumni", img: "sunny.jpg" },
  { name: "Ashu Sharma", role: "Club Alumni", img: "ashu.jpg" },
  { name: "Akarsh Agarwal", role: "Club Alumni", img: "akarsh.jpg" },
  { name: "Dipti Mishra", role: "Club Alumni", img: "deepti.jpg" },
  { name: "Hritvik Ranjan", role: "Club Alumni", img: "hritvik.jpg" },
  { name: "Laxmi Narayan", role: "Club Alumni", img: "narayan.jpg" },
  { name: "Rupesh Raj Tripathy", role: "Club Alumni", img: "rupesh.jpg" },
  { name: "Shradha Kyal", role: "Club Alumni", img: "sradha.jpg" },
  { name: "Sonali Sahu", role: "Club Alumni", img: "sonali.jpg" },
  { name: "Niharika Kumari", role: "Club Alumni", img: "Niharika.jpg" },
  { name: "Suraj Kumar Sahu", role: "Club Alumni", img: "suraj.jpg" },
  { name: "Sarbajit Mohanty", role: "Club Alumni", img: "sarbajit.jpg" },
  { name: "Sanjeev", role: "Club Alumni", img: "sanjeev.jpg" },
  { name: "Pabitra", role: "Club Alumni", img: "Pabitra.jpg" },
  { name: "Vibhav", role: "Club Alumni", img: "vibhav.jpg" },
  { name: "Varsha", role: "Club Alumni", img: "varsha.jpg" },
  { name: "Biswamohan", role: "Club Alumni", img: "Biswabhiya.jpg" },
  { name: "Faizan", role: "Club Alumni", img: "faizanbhiya.jpg" },
  { name: "Kishlay", role: "Club Alumni", img: "kishlaybhiya.png" },
  { name: "Richa", role: "Club Alumni", img: "richadi.jpg" },
  { name: "Ankit", role: "Club Alumni", img: "Ankitbhiya.jpg" },
  { name: "Srikant", role: "Club Alumni", img: "srikant.jpg" },
  { name: "Sanket", role: "Club Alumni", img: "sanket.jpg" },
  { name: "samrat", role: "Club Alumni", img: "samrat.jpg" },
  { name: "Rupa", role: "Club Alumni", img: "rupa.jpg" },
];
