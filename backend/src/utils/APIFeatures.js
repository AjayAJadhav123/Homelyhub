// ---- APIFeatures: builds the search query, 
// The listings page has filters, a search box and pages. Doing
// all that inside the controller would make it 100 lines long.
// So we keep it here, and the controller stays clean:
//     new APIFeatures(Property.find(), req.query)
//       .filter().search().paginate()
//
// A class is a blueprint. 'new' makes one copy to work with.
class APIFeatures {
  // constructor runs once, when we say 'new APIFeatures(...)'
  // query       = the unfinished mongoose search
  // queryString = what the user asked for (req.query), the
  //               part of the address after the ? mark
  constructor(query, queryString) {
    (this.query = query), (this.queryString = queryString);
  }

  // FILTER - the tick boxes: price, type, room, amenities
  filter() {
    // start empty, and add a rule only if the user asked for it
    let filterQuery = {};
    // ... makes a copy, so we never damage the original
    let queryObj = { ...this.queryString };

    // PRICE. $gte = greater than or equal, $lte = less or equal.
    // The > sign means 'and above', so there is no upper limit.
    if (queryObj.minPrice && queryObj.maxPrice) {
      if (queryObj.maxPrice.includes(">")) {
        filterQuery.price = { $gte: queryObj.minPrice };
      } else {
        filterQuery.price = {
          $gte: queryObj.minPrice,
          $lte: queryObj.maxPrice,
        };
      }
    }

    // TYPE. It arrives as one string 'House,Flat', so we cut it
    // at the commas and trim the spaces. $in = match any of them.
    if (queryObj.propertyType) {
      let propertyTypeArray = queryObj.propertyType
        .split(",")
        .map((value) => value.trim());
      filterQuery.propertyType = { $in: propertyTypeArray };
    }

    // ROOM TYPE. Only one value, so a plain match is enough.
    if (queryObj.roomType) {
      filterQuery.roomType = queryObj.roomType;
    }

    // AMENITIES. May arrive as one value or as a list, so we
    // force it into a list either way.
    if (queryObj.amenities) {
      const amenitiesArray = Array.isArray(queryObj.amenities)
        ? queryObj.amenities
        : [queryObj.amenities];

      // the dot goes INSIDE the amenities object.
      // $all = must have ALL of them, not just one.
      filterQuery["amenities.name"] = { $all: amenitiesArray };
    }

    if (queryObj.bedrooms) {
      filterQuery.bedrooms = { $gte: Number(queryObj.bedrooms) };
    }

    if (queryObj.isFurnished !== undefined) {
      filterQuery.isFurnished = queryObj.isFurnished === 'true';
    }

    // add these rules to the search. Nothing runs yet - mongoose
    // only collects the rules until we await it.
    this.query = this.query.find(filterQuery);
    // return this = give the object back, so the next method can
    // be joined on with a dot: .filter().search().paginate()
    return this;
  }


  // SEARCH - the box on top: city, title, guests, dates
  search() {
    let searchQuery = {};
    let queryObj = { ...this.queryString };

    // TITLE & CITY (Search input)
    // Case-insensitive search using Regex
    if (queryObj.search) {
      const regex = new RegExp(queryObj.search, "i");
      searchQuery = {
        $or: [
          { propertyName: regex },
          { "address.city": regex },
          { "address.state": regex },
          { "address.area": regex },
        ]
      };
    } else if (queryObj.city) {
      // Keep backward compatibility
      const regex = new RegExp(queryObj.city, "i");
      searchQuery = {
        $or: [
          { "address.city": regex },
          { "address.state": regex },
          { "address.area": regex },
        ]
      };
    }

    // GUESTS. The house must hold at least this many people.
    if (queryObj.guests) {
      searchQuery.maximumGuest = { $gte: Number(queryObj.guests) };
    }

    // DATES
    if (queryObj.dateIn && queryObj.dateOut) {
      // Convert DD-MM-YYYY to YYYY-MM-DD for proper Date parsing
      const parseDate = (dateStr) => {
        if (!dateStr || !dateStr.includes("-")) return new Date(dateStr);
        const [dd, mm, yyyy] = dateStr.split("-");
        return new Date(`${yyyy}-${mm}-${dd}`);
      };

      const dateInObj = parseDate(queryObj.dateIn);
      const dateOutObj = parseDate(queryObj.dateOut);

      searchQuery.$and = [
        {
          currentBookings: {
            $not: {
              $elemMatch: {
                $or: [
                  {
                    fromDate: { $lt: dateOutObj },
                    toDate: { $gt: dateInObj },
                  },
                  {
                    fromDate: { $lt: dateInObj },
                    toDate: { $gt: dateInObj },
                  },
                ],
              },
            },
          },
        },
      ];
    }

    this.query = this.query.find(searchQuery);
    return this;
  }

  // SORTING
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }


  // PAGINATE - show 8 at a time, not 500 at once
  paginate() {
    // * 1 turns the text '2' into the number 2.
    // || 1 means: nothing sent, so start at page 1.
    let page = this.queryString.page * 1 || 1;
    // how many per page. 8 by default.
    let limit = this.queryString.limit * 1 || 8;
    // page 1 skips 0, page 2 skips 8, page 3 skips 16
    let skip = (page - 1) * limit;

    // skip that many, then take only 'limit' of them
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}


// propertyController imports this to build the listings search
export { APIFeatures };
