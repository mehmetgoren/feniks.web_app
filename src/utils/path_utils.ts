import {AiDataDto} from 'src/utils/models/ai_data_dtos';
import {LocalService} from 'src/utils/services/local_service';
import {fixArrayDates, isNullOrEmpty} from 'src/utils/utils';

export function setUpDatesAndPaths(localService: LocalService, items: AiDataDto[]): AiDataDto[] {
  if (!items || !items.length)
    return items;
  if (!localService)
    localService = new LocalService();

  fixArrayDates(items, 'created_at')
  for (const item of items) {
    if (!item)
      continue;
    if (!isNullOrEmpty(item.image_file_name))
      item.image_file_name = localService.getServerAddressWithoutDash(item.image_file_name);
    if (!isNullOrEmpty(item.video_file?.name))
      item.video_file.name = localService.getServerAddressWithoutDash(item.video_file.name);
    if (!isNullOrEmpty(item.ai_clip?.file_name))
      item.ai_clip.file_name = localService.getServerAddressWithoutDash(item.ai_clip.file_name);
  }

  return items;
}
