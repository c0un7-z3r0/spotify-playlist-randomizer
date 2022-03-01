import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs'
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { ConfigService } from '@nestjs/config';
import { HealthCheckResult, HealthIndicator } from '@nestjs/terminus';
class BaseRecord {
    id: string;
}

class ArtistRecord extends BaseRecord {
    name: string;
}

export class PlaylistRecord extends BaseRecord {
  name: string;
  id: string;
  artist: ArtistRecord;
}

export class PlaylistsData {
    [id: number]: PlaylistRecord;
}

export class GetAllResult<Item> {
    [key: string]: Item;
}

@Injectable()
export class JsondbService {
    private db: JsonDB;
    private readonly logger = new Logger(JsondbService.name);
    private dbPath:string = ''
    constructor(private configService: ConfigService) {
        this.dbPath = `${this.configService.get<string>('DB_PATH') ?? 'data'}/db`

        this.db = new JsonDB(
            new Config(this.dbPath,
                true,
                true,
                '/',
            ),
        );
    }

    add<RecordType extends BaseRecord>(
        dbKey: string,
        record: RecordType,
    ): RecordType {
        const { id, ...data } = record;
        if (!id) {
            throw new Error('Missing id');
        }
        if (!data) {
            throw new Error('Missing data');
        }
        this.db.push(`/db/${dbKey}/${id}`, {
            ...data,
            id,
        });
        return record;
    }

    getAll<ResultItem>(dbKey: string): GetAllResult<ResultItem> {
        try {
            return this.db.getObject<GetAllResult<ResultItem>>(`/db/${dbKey}`);
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    getById<ResultItem>(dbKey: string, id: string): ResultItem {
        if (!id) {
            throw new Error('Missing id');
        }
        return this.db.getObject<ResultItem>(`/db/${dbKey}/${id}`);
    }

    updateById<RecordType, ResultItem>(
        dbKey: string,
        id: string,
        record: Partial<RecordType>,
    ): ResultItem {
        const oldEntry = this.getById<ResultItem>(dbKey, id);
        const newEntry = { ...oldEntry, ...record };
        this.db.push(`/db/${dbKey}/${id}`, {
            ...newEntry,
        });
        return newEntry;
    }

    deleteById(dbKey: string, id: string): void {
        if (!id) {
            throw new Error('Missing id');
        }
        try {
            return this.db.delete(`/db/${dbKey}/${id}`);
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    isHealthy(): boolean{
        return fs.statSync(this.dbPath ).isFile() ?? false;
    }
}
