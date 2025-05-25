import AsyncSelect from 'react-select/async';
import axios from 'axios';

const loadOptions = async (inputValue) => {
  try {
    const response = await axios.get(`/api/users?q=${inputValue}`);
    return response.data.map(user => ({
      label: `${user.name} (@${user.username})`,
      value: user._id,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

const SearchDropdown = ({ onSelect }) => (
  <AsyncSelect
    cacheOptions
    loadOptions={loadOptions}
    onChange={onSelect}
    placeholder="Search for friends..."
  />
);

export default SearchDropdown;
