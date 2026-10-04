import React, { useState, useEffect } from "react";
import { DatePicker, Space } from "antd";
import "react-datepicker/dist/react-datepicker.css";
import "../../css/Home.css";

import { useDispatch } from "react-redux";
import { propertyAction } from "../../store/Property/property-slice";
import { getAllProperties } from "../../store/Property/property-action";

import { useSearchParams } from "react-router-dom";

const Search = () => {
  const { RangePicker } = DatePicker;
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getKeywordFromUrl = () => {
    const k = {};
    if (searchParams.get("search")) k.search = searchParams.get("search");
    if (searchParams.get("dateIn")) k.dateIn = searchParams.get("dateIn");
    if (searchParams.get("dateOut")) k.dateOut = searchParams.get("dateOut");
    if (searchParams.get("guests")) k.guests = Number(searchParams.get("guests"));
    return k;
  };

  const [keyword, setKeyword] = useState(getKeywordFromUrl());
  const [value, setValue] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    // Sync initial dates for RangePicker
    if (keyword.dateIn && keyword.dateOut) {
      // Need moment or dayjs, but since value is just for UI let's omit or set as string if antd allows, 
      // actually antd range picker needs dayjs objects usually, we'll leave value alone if it errors.
    }
  }, []);

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Object.keys(keyword).length > 0) {
        dispatch(propertyAction.updateSearchParams({ ...keyword, page: 1 }));
        dispatch(getAllProperties());
        
        // Update URL
        const newParams = new URLSearchParams(searchParams);
        Object.keys(keyword).forEach(key => {
          if (keyword[key]) newParams.set(key, keyword[key]);
          else newParams.delete(key);
        });
        setSearchParams(newParams);
      }
    }, 600);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword, dispatch]);

  function searchHandler(e) {
    e.preventDefault();
    dispatch(propertyAction.updateSearchParams({ ...keyword, page: 1 }));
    dispatch(getAllProperties());
    const newParams = new URLSearchParams(searchParams);
    Object.keys(keyword).forEach(key => {
      if (keyword[key]) newParams.set(key, keyword[key]);
      else newParams.delete(key);
    });
    setSearchParams(newParams);
  }

  function returnDates(date, dateString) {
    if (date) {
      setValue([date[0], date[1]]);
      updateKeyword("dateIn", dateString[0]);
      updateKeyword("dateOut", dateString[1]);
    } else {
      setValue([]);
      updateKeyword("dateIn", "");
      updateKeyword("dateOut", "");
    }
  }

  const updateKeyword = (field, val) => {
    setKeyword((prevKeyword) => ({
      ...prevKeyword,
      [field]: val,
    }));
  };

  return (
    <>
      <div className="searchbar">
        <input
          className="search"
          id="search_destination"
          placeholder="Search destinations or property"
          type="text"
          value={keyword.search || ""}
          onChange={(e) => updateKeyword("search", e.target.value)}
        />
        <Space direction="vertical" size={12}>
          <RangePicker
            value={value}
            format="DD-MM-YYYY"
            picker="date"
            className="date_picker"
            disabledDate={(current) => {
              return current && current.isBefore(Date.now(), "day");
            }}
            onChange={returnDates}
          />
        </Space>
        <input
          className="search"
          id="addguest"
          placeholder="Add guests"
          type="number"
          onChange={(e) => updateKeyword("guests", +e.target.value)}
        />
        <span
          className="material-symbols-outlined searchicon"
          onClick={searchHandler}
        >
          search
        </span>
      </div>
    </>
  );
};

export default Search;
