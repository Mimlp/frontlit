import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy',
  standalone: true
})
export class FilterByPipe implements PipeTransform {
  transform<T>(
    items: T[],
    searchTerm: string,
    property: keyof T
  ): T[] {
    if (!items || !searchTerm) {
      return items;
    }

    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item => {
      const value = item[property];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearch);
      }
      return false;
    });
  }
}
