import { useEffect, useState } from 'react';
import './App.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import items from './data/resource';

const getFormatedCheckListItems = (listOfItems) => {
  const checkList = [];
  listOfItems.forEach((item) => {
    if (item.category !== undefined) {
      //item has catagory and will be added subCatagories array
      let categoryFound = checkList.find(
        (checkListItem) => checkListItem.name === item.category.name
      );

      if (categoryFound) {
        categoryFound.subCategories.push(item);
      } else {
        const newCategory = {
          ...item.category,
          subCategories: [item],
        };
        checkList.push(newCategory);
      }
    } else {
      let emptyCategoryFound = checkList.find(
        (checkListItem) => checkListItem.name === ''
      );
      if (emptyCategoryFound) {
        emptyCategoryFound.subCategories.push(item);
      } else {
        const emptyCategory = {
          name: '',
          subCategories: [item],
        };
        checkList.push(emptyCategory);
      }
    }
  });
  return checkList;
};

function App() {
  const formik = useFormik({
    initialValues: {
      name: '',
      rate: 5,
      applied_to: 'some',
      searchText: '',
      applicable_items: [],
      category: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required('required'),
    }),
    onSubmit: (values) => {
      const alertObj = {
        applicable_items: values.applicable_items,
        applied_to: values.applied_to,
        name: values.name,
        rate: values.rate / 100,
      };
      alert(JSON.stringify(alertObj, null, 2));
    },
  });

  const [checkListItems, setCheckListItems] = useState(
    getFormatedCheckListItems(items)
  );

  useEffect(() => {
    if (formik.values.applied_to === 'all') {
      let updatedList = items.map((item) => item.id.toString());
      console.log(updatedList);
      formik.setFieldValue('applicable_items', updatedList);
    }
  }, [formik.values.applied_to]);

  useEffect(() => {
    if (formik.values.applicable_items.length === items.length) {
      formik.setFieldValue('applied_to', 'all');
    } else {
      formik.setFieldValue('applied_to', 'some');
    }
  }, [formik.values.applicable_items]);

  useEffect(() => {
    formik.setFieldValue('applicable_items', []);
    const newCheckListItems = items.filter((item) =>
      item.name.toLowerCase().includes(formik.values.searchText.toLowerCase())
    );

    setCheckListItems(getFormatedCheckListItems(newCheckListItems));
  }, [formik.values.searchText]);

  const handleCatagoryCheck = (event) => {
    const { name, checked } = event.target;

    let updatedList = [...formik.values.applicable_items];

    const nameOfCategory = name.split('-')[1];
    // console.log('nameOfCategory : ' + nameOfCategory);
    const selectedCategory = checkListItems.find(
      (item) => item.name === nameOfCategory
    );

    if (checked) {
      selectedCategory.subCategories.forEach((item) => {
        if (!isChecked(item.id)) {
          updatedList.push(item.id.toString());
        }
      });
    } else {
      selectedCategory.subCategories.forEach((item) => {
        if (isChecked(item.id)) {
          updatedList.splice(
            formik.values.applicable_items.indexOf(item.id),
            1
          );
        }
      });
    }

    formik.setFieldValue('applicable_items', updatedList);
  };

  const isCatagoryChecked = (name) => {
    let allChecked = true;
    const selectedCategory = checkListItems.find((item) => item.name === name);

    selectedCategory?.subCategories.forEach((category) => {
      allChecked = allChecked && isChecked(category.id);
    });
    return allChecked;
  };

  const isChecked = (item) =>
    formik.values.applicable_items.includes(item.toString());

  return (
    <div className='App'>
      <div className='w-full'>
        <div className='max-w-3xl mx-auto shadow-md py-8 my-4 text-gray-700'>
          <h1 className='text-2xl mb-4 px-8'>Add Tax</h1>
          <form onSubmit={formik.handleSubmit}>
            <div className='flex mb-2 px-8 max-w-xl'>
              <div className='relative w-3/4 mr-2'>
                <input
                  className={`input-border w-full p-2 text-sm  ${
                    formik.touched.name && formik.errors.name && 'input-error'
                  }`}
                  name='name'
                  placeholder='Tax Name'
                  type='text'
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className='text-red-500'>{formik.errors.name}</p>
                )}
              </div>
              <div className='relative w-1/4'>
                <input
                  className='input-border w-full p-2 text-sm  pr-6'
                  name='rate'
                  placeholder='Tax Value'
                  type='number'
                  value={formik.values.rate}
                  onChange={formik.handleChange}
                />
                <span className='absolute text-sm text-gray-400 right-3 top-2'>
                  %
                </span>
              </div>
            </div>
            <div className='flex-col px-9 my-4 text-sm'>
              <label className='block mb-2'>
                <div className='pointer'>
                  <input
                    name='applied_to'
                    type='radio'
                    className='radio-input'
                    value='all'
                    checked={formik.values.applied_to === 'all'}
                    onChange={formik.handleChange}
                  />
                  <div
                    color='#F16D37'
                    className={`${
                      formik.values.applied_to === 'all'
                        ? 'radio-active'
                        : 'radio-not-active'
                    }`}
                  >
                    <svg
                      color='#F16D37'
                      viewBox='0 0 24 24'
                      className='visible svg-radio'
                    >
                      <polyline points='20 6 9 17 4 12'></polyline>
                    </svg>
                  </div>
                </div>
                <span className='ml-2'>Apply to all items in collection</span>
              </label>
              <label className='block'>
                <div className='pointer'>
                  <input
                    name='applied_to'
                    type='radio'
                    className='radio-input'
                    value='some'
                    checked={formik.values.applied_to === 'some'}
                    onChange={formik.handleChange}
                  />
                  <div
                    color='#F16D37'
                    className={`${
                      formik.values.applied_to === 'some'
                        ? 'radio-active'
                        : 'radio-not-active'
                    }`}
                  >
                    <svg
                      color='#F16D37'
                      viewBox='0 0 24 24'
                      className='visible svg-radio'
                    >
                      <polyline points='20 6 9 17 4 12'></polyline>
                    </svg>
                  </div>
                </div>
                <span className='ml-2'>Apply to specific items</span>
              </label>
            </div>

            <div className='w-full border-t border-gray-200 px-8 mt-4 pt-4'>
              <div className='relative w-72'>
                <span className='absolute text-sm left-2 top-3'>
                  <svg
                    stroke='currentColor'
                    fill='currentColor'
                    strokeWidth='0'
                    viewBox='0 0 1024 1024'
                    className='text-md text-gray-500'
                    height='1em'
                    width='1em'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z'></path>
                  </svg>
                </span>
                <input
                  name='searchText'
                  className='input-border w-full p-2 text-sm pl-6 '
                  placeholder='Search Items'
                  value={formik.values.searchText}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='w-full px-8'>
              {checkListItems?.length > 0 &&
                checkListItems.map((checkListItem, index) => (
                  <div key={index}>
                    <div className='mt-4 w-full'>
                      <label className='text-sm w-full inline-block bg-gray-200 px-3 py-2'>
                        <div className='sc-bdvvtL RlBMJ'>
                          <input
                            type='checkbox'
                            className='sc-dkPtRN ctxvUT'
                            name={`main-${checkListItem.name}`}
                            onChange={handleCatagoryCheck}
                            value={checkListItem.name}
                            checked={isCatagoryChecked(checkListItem.name)}
                          />
                          <div
                            color='#327B91'
                            className={`sc-hKwDye ${
                              isCatagoryChecked(checkListItem.name)
                                ? 'checkbox-active'
                                : 'checkbox-not-active'
                            }`}
                          >
                            <svg
                              color='#327B91'
                              viewBox='0 0 24 24'
                              className='visible svg-checkbox'
                            >
                              <polyline points='20 6 9 17 4 12'></polyline>
                            </svg>
                          </div>
                        </div>
                        <span className='ml-4'>{checkListItem.name}</span>
                      </label>
                    </div>
                    {checkListItem.subCategories.length > 0 &&
                      checkListItem.subCategories.map(
                        (subCategoryItem, index) => (
                          <div key={index} className='mt-4 w-full pl-4'>
                            <label className='text-sm w-full inline-block px-3 py-2'>
                              <div className='sc-bdvvtL RlBMJ'>
                                <input
                                  type='checkbox'
                                  className='sc-dkPtRN ctxvUT'
                                  value={subCategoryItem.id}
                                  name={'applicable_items'}
                                  onChange={formik.handleChange}
                                  checked={isChecked(subCategoryItem.id)}
                                />
                                <div
                                  color='#327B91'
                                  className={`sc-hKwDye ${
                                    isChecked(subCategoryItem.id)
                                      ? 'checkbox-active'
                                      : 'checkbox-not-active'
                                  }`}
                                >
                                  <svg
                                    color='#327B91'
                                    viewBox='0 0 24 24'
                                    className='visible svg-checkbox'
                                  >
                                    <polyline points='20 6 9 17 4 12'></polyline>
                                  </svg>
                                </div>
                              </div>
                              <span className='ml-4'>
                                {subCategoryItem.name}
                              </span>
                            </label>
                          </div>
                        )
                      )}
                  </div>
                ))}
            </div>
            <div className='w-full flex justify-end px-8'>
              <button
                type='submit'
                className=' apply-btn px-4 py-2 text-lg text-white undefined'
              >
                Apply tax to {formik.values.applicable_items.length} item(s)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
