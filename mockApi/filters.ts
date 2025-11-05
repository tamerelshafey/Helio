import { propertyTypesData, finishingStatusesData, amenitiesData } from '../data/filterOptions';
import type { FilterOption } from '../types';

type DataType = 'propertyType' | 'finishingStatus' | 'amenity';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAllPropertyTypes = async (): Promise<FilterOption[]> => {
    await delay(50);
    return [...propertyTypesData];
};

export const getAllFinishingStatuses = async (): Promise<FilterOption[]> => {
    await delay(50);
    return [...finishingStatusesData];
};

export const getAllAmenities = async (): Promise<FilterOption[]> => {
    await delay(50);
    return [...amenitiesData];
};

const getDataSet = (dataType: DataType) => {
    switch (dataType) {
        case 'propertyType': return propertyTypesData;
        case 'finishingStatus': return finishingStatusesData;
        case 'amenity': return amenitiesData;
    }
};

export const addFilterOption = async (dataType: DataType, option: Omit<FilterOption, 'id'>): Promise<FilterOption> => {
    await delay(100);
    const newOption = { ...option, id: `${dataType}-${Date.now()}` };
    getDataSet(dataType).push(newOption);
    return newOption;
};

export const updateFilterOption = async (dataType: DataType, option: FilterOption): Promise<FilterOption | undefined> => {
    await delay(100);
    const dataSet = getDataSet(dataType);
    const index = dataSet.findIndex(o => o.id === option.id);
    if (index > -1) {
        dataSet[index] = option;
        return dataSet[index];
    }
    return undefined;
};

export const deleteFilterOption = async (dataType: DataType, id: string): Promise<boolean> => {
    await delay(100);
    // FIX: Use splice to mutate arrays directly instead of reassigning imported variables.
    let dataSet;
    switch (dataType) {
        case 'propertyType':
            dataSet = propertyTypesData;
            break;
        case 'finishingStatus':
            dataSet = finishingStatusesData;
            break;
        case 'amenity':
            dataSet = amenitiesData;
            break;
        default:
            return false;
    }
    const index = dataSet.findIndex(o => o.id === id);
    if (index > -1) {
        dataSet.splice(index, 1);
        return true;
    }
    return false;
};
