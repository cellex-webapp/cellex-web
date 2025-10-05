export interface Province {
  code: string; 
  name: string; 
  codeName: string; 
  divisionType: string; 
  phoneCode: number;
}

export interface Commune {
  code: string; 
  name: string; 
  codeName: string;
  divisionType: string; 
  provinceCode: string; 
  districtCode: string; 
}
