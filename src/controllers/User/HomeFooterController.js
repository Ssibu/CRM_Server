

// import models from "../../models/index.js";

// const { Footerlink, ImportantLink, HomeSetting, Visitor} = models;

// /**
//  * @description Controller to fetch and aggregate all data required for the website footer.
//  * @route GET /api/v1/footer-data
//  * @access Public
//  */
// export const getFooterData = async (req, res) => {
//   try {
//     // Fetch all data in parallel for better performance
//     const [usefulLinksData, importantLinksData, logoRailData, homeSettings,visitorCount] =
//       await Promise.all([
//         // 1. Fetch "Useful Links" (UsefulLink)
//         Footerlink.findAll({
//           where: { linkType: "UsefulLink", status: "Active" },
//           order: [["displayOrder", "ASC"]],
//             limit:5
//         }),
//         // 2. Fetch "Important Links" (ImportantLink)
//         Footerlink.findAll({
//           where: { linkType: "ImportantLink", status: "Active" },
//           order: [["displayOrder", "ASC"]],
//           limit:5
//         }),
//         // 3. Fetch logos for the Logo Rail
//         ImportantLink.findAll({
//           where: { is_active: true },
//           attributes: ["url", "image"],
//         }),
//         // 4. Fetch contact information from Home Settings
//         HomeSetting.findOne({
//           attributes: ["en_address", "od_address", "email", "mobileNumber"],
//         }),
//          Visitor.count(), // count visitors
//       ]);

    

//     // --- Transform data to match the frontend's expected structure ---

//     // 1. Format Logo Rail data
//     const logoRail = logoRailData.map((item) => ({
//       src: item.image,
//       href: item.url,
//     }));

//     // 2. Format Useful Links data
//     const usefulLinks = {
//       en_title: "Useful Links",
//       od_title: "ଉପଯୋଗୀ ଲିଙ୍କସ୍",
//       links: usefulLinksData.map((link) => ({
//         en_title: link.en_link_text,
//         od_title: link.od_link_text,
//         href: link.url,
//       })),
//        readMore: {
//         en_title: "Read More",
//         od_title: "ଅଧିକ ପଢନ୍ତୁ",
//         href: "/useful-links", 
//       },
//     };

//     // 3. Format Important Links data
//     const importantLinks = {
//       en_title: "Important Links",
//       od_title: "ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଲିଙ୍କସ୍",
//       links: importantLinksData.map((link) => ({
//         en_title: link.en_link_text,
//         od_title: link.od_link_text,
//         href: link.url,
//       })),
//       // Added to make the frontend fully dynamic
//       readMore: {
//         en_title: "Read More",
//         od_title: "ଅଧିକ ପଢନ୍ତୁ",
//         href: "/important-links", 
//       },
//     };

//     // 4. Format Contact Info data
//     const contactInfo = {
//       en_title: "Contact Us",
//       od_title: "ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ",
//       address: {
//         en_text: homeSettings?.en_address || "Address not available",
//         od_text: homeSettings?.od_address || "Address not available",
//       },

//       email: {
//         en_text: (homeSettings?.email || "")
//           .replace(/@/g, "[at]")
//           .replace(/\./g, "[dot]"),
//         od_text: (homeSettings?.email || "")
//           .replace(/@/g, "[at]")
//           .replace(/\./g, "[dot]"),
//         href: `mailto:${homeSettings?.email || ""}`,
//       },
//       phone: {
//         en_text: homeSettings?.mobileNumber || "Phone not available",
//         od_text: homeSettings?.mobileNumber || "Phone not available",
//         href: `tel:${homeSettings?.mobileNumber || ""}`,
//       },
//     };

//     // --- Construct the final response object ---
//     const responsePayload = {
//       logoRail,
//       usefulLinks,
//       importantLinks,
//       contactInfo,
//       totalVisitors: visitorCount, // ✅ now matches
//     };

//     res.status(200).json(responsePayload);
//   } catch (error) {
//     console.error("Error fetching footer data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve footer information.",
//       error: error.message,
//     });
//   }
// };



import models from "../../models/index.js";

const { Footerlink, ImportantLink, HomeSetting, Visitor } = models;

export const getFooterData = async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress ||
      req.ip;

    // Visitor logic: increment visitCount on every page load
    const [visitor, created] = await Visitor.findOrCreate({
      where: { ipAddress: ip },
      defaults: { visitedAt: new Date(), visitCount: 1 },
    });

    if (!created) {
      visitor.visitCount += 1;
      visitor.visitedAt = new Date();
      await visitor.save();
    }

    // Fetch footer-related data
    const [usefulLinksData, importantLinksData, logoRailData, homeSettings] =
      await Promise.all([
        Footerlink.findAll({
          where: { linkType: "UsefulLink", status: "Active" },
          order: [["displayOrder", "ASC"]],
          limit: 5,
        }),
        Footerlink.findAll({
          where: { linkType: "ImportantLink", status: "Active" },
          order: [["displayOrder", "ASC"]],
          limit: 5,
        }),
        ImportantLink.findAll({
          where: { is_active: true },
          attributes: ["url", "image"],
        }),
        HomeSetting.findOne({
          attributes: ["en_address", "od_address", "email", "mobileNumber"],
        }),
      ]);

    // Count visitors
    // const uniqueVisitors = await Visitor.count(); // Unique IPs
    const totalVisitors = await Visitor.sum("visitCount"); // Total opens including refreshes

    const logoRail = logoRailData.map((item) => ({
      src: item.image,
      href: item.url,
    }));

    const usefulLinks = {
      en_title: "Useful Links",
      od_title: "ଉପଯୋଗୀ ଲିଙ୍କସ୍",
      links: usefulLinksData.map((link) => ({
        en_title: link.en_link_text,
        od_title: link.od_link_text,
        href: link.url,
      })),
      readMore: {
        en_title: "Read More",
        od_title: "ଅଧିକ ପଢନ୍ତୁ",
        href: "/useful-links",
      },
    };

    const importantLinks = {
      en_title: "Important Links",
      od_title: "ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଲିଙ୍କସ୍",
      links: importantLinksData.map((link) => ({
        en_title: link.en_link_text,
        od_title: link.od_link_text,
        href: link.url,
      })),
      readMore: {
        en_title: "Read More",
        od_title: "ଅଧିକ ପଢନ୍ତୁ",
        href: "/important-links",
      },
    };

    const contactInfo = {
      en_title: "Contact Us",
      od_title: "ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ",
      address: {
        en_text: homeSettings?.en_address || "Address not available",
        od_text: homeSettings?.od_address || "Address not available",
      },
      email: {
        en_text: (homeSettings?.email || "")
          .replace(/@/g, "[at]")
          .replace(/\./g, "[dot]"),
        od_text: (homeSettings?.email || "")
          .replace(/@/g, "[at]")
          .replace(/\./g, "[dot]"),
        href: `mailto:${homeSettings?.email || ""}`,
      },
      phone: {
        en_text: homeSettings?.mobileNumber || "Phone not available",
        od_text: homeSettings?.mobileNumber || "Phone not available",
        href: `tel:${homeSettings?.mobileNumber || ""}`,
      },
    };

    const responsePayload = {
      logoRail,
      usefulLinks,
      importantLinks,
      contactInfo,
      totalVisitors: totalVisitors, // Unique visitors
    };

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error fetching footer data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve footer information.",
      error: error.message,
    });
  }
};
