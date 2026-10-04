import React, { useEffect, useState } from "react";
import FilterModal from "./FilterModal";
import { useDispatch } from "react-redux";
import { propertyAction } from "../../store/Property/property-slice";
import { getAllProperties } from "../../store/Property/property-action";
import { useSearchParams } from "react-router-dom";

const Filter = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const getFiltersFromURL = () => {
    const filters = {};
    searchParams.forEach((value, key) => {
      if (key === 'amenities') {
        filters[key] = value.split(',');
      } else {
        filters[key] = value;
      }
    });
    return filters;
  };

  const [selectedFilters, setSelectedFilters] = useState(getFiltersFromURL());

  useEffect(() => {
    const filters = getFiltersFromURL();
    setSelectedFilters(filters);
    dispatch(propertyAction.updateSearchParams(filters));
    dispatch(getAllProperties());
  }, [searchParams, dispatch]);

  const handleFilterChange = (filtersObj) => {
    const newParams = new URLSearchParams(searchParams);
    
    newParams.delete('page'); // Reset page when filters change

    Object.keys(filtersObj).forEach(key => {
      const val = filtersObj[key];
      if (val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
        newParams.delete(key);
      } else {
        if (Array.isArray(val)) {
          newParams.set(key, val.join(','));
        } else {
          newParams.set(key, val);
        }
      }
    });

    setSearchParams(newParams);
  };

  return (
    <>
      <span
        className="material-symbols-outlined filter"
        onClick={() => setIsModalOpen(true)}
      >
        tune
      </span>
      {isModalOpen && (
        <FilterModal
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Filter;
